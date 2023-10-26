{
  description = "Zellij session picker for gnome-shell";
  inputs = { flake-utils.url = "github:numtide/flake-utils"; };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs;
            [
              nodePackages.typescript-language-server nodejs_20
            ];
        };
      });
}

