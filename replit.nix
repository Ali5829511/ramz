{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
  ];
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [ pkgs.libuuid ];
  };
}
