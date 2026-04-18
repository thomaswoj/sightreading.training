# Local Setup

This is a **Lapis** (OpenResty/MoonScript/LuaJIT) + React/esbuild app with PostgreSQL — not a typical Node or PHP stack. Running locally without Docker means installing OpenResty natively via Homebrew.

## Prerequisites via Homebrew

```sh
brew install openresty/brew/openresty  # nginx + LuaJIT runtime
brew install luarocks                  # Lua package manager
brew install moonscript                # .moon → .lua compiler
brew install postgresql                # DB (or postgresql@14)
brew install node                      # for esbuild/npm
```

## LuaRocks packages

Needs to target OpenResty's LuaJIT, not system Lua — the fiddly part:

```sh
luarocks --lua-dir=/usr/local/opt/openresty/luajit install lapis
luarocks --lua-dir=/usr/local/opt/openresty/luajit install bcrypt
luarocks --lua-dir=/usr/local/opt/openresty/luajit install tableshape
eval $(luarocks --lua-dir=/usr/local/opt/openresty/luajit path)  # add to shell profile
```

## DB setup

```sh
createdb -U postgres sightreading
make init_schema   # loads schema.sql
make migrate
```

## Frontend

```sh
npm install
# esbuild is invoked via Tup (build system) or directly per Tuprules.tup
# Tup requires macFUSE on macOS; workaround: tup generate build.sh && ./build.sh
```

## Running the app

```sh
lapis server          # starts OpenResty/nginx on port 9090 (see config.moon)
lapis term            # stops it
```

## Notes

- OpenResty installs to `/usr/local/opt/openresty` on Intel Macs — LuaJIT binary at `.../luajit/bin/luajit`
- The Dockerfile in the repo is CI-only (runs tests, no dev server, no exposed port) — not useful for local dev
- Tup build system requires macFUSE (kernel ext) on macOS; `tup generate build.sh` produces a plain shell script you can run directly to avoid needing Tup after the first time
