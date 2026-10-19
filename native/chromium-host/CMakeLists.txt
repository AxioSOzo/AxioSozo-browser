# Linux build of the AxioSozo CEF engine host (portable core + Linux platform layer).
# macOS keeps its Xcode build in probe.py setup. Normally invoked by
#   python3 native/chromium-host/probe.py setup
# which downloads and verifies the pinned distribution, then runs:
#   cmake -S native/chromium-host -B $BUILD/cmake -G Ninja -DCMAKE_BUILD_TYPE=Release \
#         -DCEF_ROOT=$BUILD/cef_binary_..._linux64_minimal -DAXIO_OUT=$BUILD/linux64
#   cmake --build $BUILD/cmake
#
# The host uses CEF's stable C API (include/capi), exactly like the macOS host, so it
# links libcef.so directly and does not need libcef_dll_wrapper. Compiler and linker
# flags come from the distribution's own cmake/ (FindCEF), except the rpath: CEF's
# default "-Wl,-rpath,." would search the *working directory*; the host uses $ORIGIN.
cmake_minimum_required(VERSION 3.21)
# C is enabled only because the distribution's cef_variables.cmake probes C flags.
project(axiosozo_cef_host C CXX)

if(NOT CMAKE_SYSTEM_NAME STREQUAL "Linux")
  message(FATAL_ERROR "This CMake project builds the Linux host only; macOS uses probe.py setup.")
endif()
set(CEF_ROOT "" CACHE PATH "Extracted, SHA-256 verified CEF minimal distribution (upstreams.lock.json)")
set(AXIO_OUT "${CMAKE_BINARY_DIR}/out" CACHE PATH "Runtime directory: host binaries, libcef.so and resources")
if(NOT IS_DIRECTORY "${CEF_ROOT}/cmake")
  message(FATAL_ERROR "CEF_ROOT must point at the pinned CEF distribution")
endif()
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
option(AXIO_COPY_RUNTIME "Copy libcef.so and resources next to the executables (probe.py hard-links them instead)" OFF)

# The distribution's cef_variables.cmake assumes x86_64 (-m64 -march=x86-64) unless told.
if(CMAKE_SYSTEM_PROCESSOR MATCHES "^(aarch64|arm64)$")
  set(PROJECT_ARCH "arm64")
endif()
list(APPEND CMAKE_MODULE_PATH "${CEF_ROOT}/cmake")
find_package(CEF REQUIRED)
find_package(ZLIB REQUIRED)
list(REMOVE_ITEM CEF_LINKER_FLAGS "-Wl,-rpath,.")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${AXIO_OUT}")
add_library(axio_host_core STATIC core/host_core.cc linux/platform_linux.cc)
SET_LIBRARY_TARGET_PROPERTIES(axio_host_core)
target_compile_definitions(axio_host_core PRIVATE CEF_API_VERSION=15400)
target_link_libraries(axio_host_core PUBLIC "${CEF_LIB_RELEASE}" ZLIB::ZLIB pthread)

foreach(target AxioCEFProbe AxioCEFProbeHelper)
  if(target STREQUAL "AxioCEFProbe")
    add_executable(${target} linux/main_linux.cc)
  else()
    add_executable(${target} linux/helper_linux.cc)
  endif()
  SET_EXECUTABLE_TARGET_PROPERTIES(${target})
  target_compile_definitions(${target} PRIVATE CEF_API_VERSION=15400)
  target_link_libraries(${target} PRIVATE axio_host_core)
  set_target_properties(${target} PROPERTIES BUILD_RPATH "$ORIGIN" SKIP_BUILD_RPATH FALSE)
endforeach()

# Runtime files next to the executables (README "Redistribution" of the distribution).
# probe.py setup hard-links them (libcef.so is ~1.4 GB). chrome-sandbox is never
# modified by the build; making it root:root 4755 is a separate, explicit privileged
# step (probe.py install-sandbox).
if(AXIO_COPY_RUNTIME)
  COPY_FILES(AxioCEFProbe "${CEF_BINARY_FILES}" "${CEF_BINARY_DIR_RELEASE}" "${AXIO_OUT}")
  COPY_FILES(AxioCEFProbe "${CEF_RESOURCE_FILES}" "${CEF_RESOURCE_DIR}" "${AXIO_OUT}")
endif()

# Portable-core and transport unit tests (no CEF runtime).
add_executable(axio_core_test tests/core_test.cc)
target_include_directories(axio_core_test PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
set_target_properties(axio_core_test PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/tests")
add_executable(axio_transport_test test_transport.cc)
target_link_libraries(axio_transport_test PRIVATE pthread)
set_target_properties(axio_transport_test PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/tests")
add_executable(axio_transport_damage_test tests/transport_damage_test.cc)
target_include_directories(axio_transport_damage_test PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
target_link_libraries(axio_transport_damage_test PRIVATE pthread)
set_target_properties(axio_transport_damage_test PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/tests")
add_executable(axio_transport_damage_payload_test tests/transport_damage_payload_test.cc)
target_include_directories(axio_transport_damage_payload_test PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
target_link_libraries(axio_transport_damage_payload_test PRIVATE pthread)
set_target_properties(axio_transport_damage_payload_test PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/tests")
add_executable(axio_a11y_core_test tests/a11y_core_test.cc)
target_include_directories(axio_a11y_core_test PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
set_target_properties(axio_a11y_core_test PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/tests")
foreach(test axio_core_test axio_transport_test axio_transport_damage_test axio_transport_damage_payload_test axio_a11y_core_test)
  target_compile_options(${test} PRIVATE -Wall -Wextra -UNDEBUG)
endforeach()
