// Included by stream.inc next to its other forward declarations (after Tab and
// before streamReadyEvent/streamCommand); a11y.inc defines these after input.inc.
// See docs/design/engine-accessibility.md §8.
static cef_client_t* axClientFor(Tab* tab);
static void axTabClosed(Tab* tab);
static NSNumber* axCapability();
static NSArray* axActionNames();
static NSDictionary* axCommandFields();
static NSArray* axOptionalFields(NSString* method);
static bool axAcknowledge(NSDictionary* supplied,NSDictionary* command);
static bool axCommand(Tab* tab,NSString* method,NSDictionary* command,NSString* requestId);
