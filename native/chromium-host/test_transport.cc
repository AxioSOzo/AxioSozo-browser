// Deterministic native transport test, not CEF render/integration evidence.
#include "transport.hpp"
#include <cassert>
#include <csignal>
#include <iostream>
#include <sys/wait.h>

static void exact(int fd,void* data,size_t size){
  auto* p=static_cast<unsigned char*>(data);
  while(size){pollfd f{fd,POLLIN,0};assert(poll(&f,1,5000)>0);ssize_t n=read(fd,p,size);assert(n>0);p+=n;size-=size_t(n);}
}
static std::pair<std::string,std::vector<uint8_t>> packet(int fd,int kind){
  std::array<uint8_t,16> h{};exact(fd,h.data(),16);
  assert(std::string(reinterpret_cast<char*>(h.data()),4)=="AXCF");assert(h[4]==0&&h[5]==1&&h[6]==0&&h[7]==kind);
  uint32_t meta=0,bytes=0;for(int i=0;i<4;i++){meta=(meta<<8)|h[8+i];bytes=(bytes<<8)|h[12+i];}
  assert(meta>0&&meta<=axio::MaxMeta&&bytes<=axio::MaxFrame);
  std::string text(meta,0);std::vector<uint8_t> payload(bytes);exact(fd,text.data(),meta);exact(fd,payload.data(),bytes);return {text,payload};
}
static void send(int fd,const std::string& text){assert(write(fd,text.data(),text.size())==ssize_t(text.size()));}
static std::string take(axio::Transport& transport){
  auto deadline=std::chrono::steady_clock::now()+std::chrono::seconds(5);
  while(std::chrono::steady_clock::now()<deadline){if(auto line=transport.pop())return *line;std::this_thread::sleep_for(std::chrono::milliseconds(1));}abort();
}
int main(){
  signal(SIGPIPE,SIG_IGN);int input[2],output[2];assert(pipe(input)==0&&pipe(output)==0);
  pid_t child=fork();assert(child>=0);
  if(!child){
    close(input[1]);close(output[0]);assert(dup2(input[0],0)>=0&&dup2(output[1],1)>=0);close(input[0]);close(output[1]);
    axio::Transport transport;assert(transport.start());
    // Source frame can be immediately reused after submission.
    uint8_t pixels[4]={1,2,3,4};assert(transport.frame("tab-a","{\"frame_id\":1}","old-target",1,pixels,4));
    assert(take(transport)=="received-one\n");
    assert(transport.frame("tab-a","{\"frame_id\":2}","old-target",2,pixels,4));
    transport.invalidatePendingFrame("tab-a"); // navigation cancels the pending old document
    pixels[0]=9;assert(transport.frame("tab-a","{\"frame_id\":3}","new-target",3,pixels,4));
    pixels[0]=8;assert(transport.frame("tab-a","{\"frame_id\":4}","new-target",4,pixels,4));
    assert(!transport.acknowledge(1,"new-target")); // no credit from wrong identity/generation
    assert(!transport.acknowledge(999,"old-target"));
    assert(transport.acknowledge(1,"old-target")); // valid even though current target advanced
    assert(!transport.acknowledge(1,"old-target")); // deduplicate acknowledgement
    assert(take(transport)=="received-four\n");
    // While one frame is in flight, each target keeps only its latest frame and
    // delivery alternates between targets.
    assert(transport.frame("tab-a","{\"frame_id\":5}","new-target",5,pixels,4));
    assert(transport.frame("tab-b","{\"frame_id\":6}","other-target",6,pixels,4));
    assert(transport.frame("tab-a","{\"frame_id\":7}","new-target",7,pixels,4));
    assert(transport.acknowledge(4,"new-target"));
    assert(take(transport)=="received-six\n");assert(transport.acknowledge(6,"other-target"));
    assert(take(transport)=="received-seven\n");assert(transport.acknowledge(7,"new-target"));
    assert(transport.event("{\"status\":\"PASS\"}"));transport.finishEvents(std::chrono::seconds(2));
    assert(take(transport)=="overflow\n");
    // Bounds reject before copying/allocating attacker-controlled payload sizes.
    assert(!transport.frame("tab-a","{}","target",9,pixels,axio::MaxFrame+1));assert(transport.failed());
    transport.stop();_exit(0);
  }
  close(input[0]);close(output[1]);
  auto first=packet(output[0],2);assert(first.first=="{\"frame_id\":1}"&&first.second==std::vector<uint8_t>({1,2,3,4}));
  send(input[1],"received-one\n");auto fourth=packet(output[0],2);
  assert(fourth.first=="{\"frame_id\":4}"&&fourth.second==std::vector<uint8_t>({8,2,3,4}));
  send(input[1],"received-four\n");
  assert(packet(output[0],2).first=="{\"frame_id\":6}");send(input[1],"received-six\n");
  assert(packet(output[0],2).first=="{\"frame_id\":7}");send(input[1],"received-seven\n");
  assert(packet(output[0],1).first=="{\"status\":\"PASS\"}");send(input[1],"overflow\n");
  close(input[1]);close(output[0]);int status=0;assert(waitpid(child,&status,0)==child&&WIFEXITED(status)&&WEXITSTATUS(status)==0);
  std::cout<<"PASS: AXCF network byte order, native copied pixels, stale exact acknowledgement, duplicate rejection, latest frame replacement per target, round-robin targets, bounded allocation, owned worker shutdown\n";
}
