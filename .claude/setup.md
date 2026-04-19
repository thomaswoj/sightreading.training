# Local Setup

This is a **Lapis** (OpenResty/MoonScript/LuaJIT) + React/esbuild app with PostgreSQL — not a typical Node or PHP stack. Running locally without Docker means installing OpenResty natively via Homebrew.

## Prerequisites via Homebrew

```sh
brew install openresty/brew/openresty  # nginx + LuaJIT runtime
brew install luarocks                  # Lua package manager
brew install moonscript                # .moon → .lua compiler
brew install postgresql@18             # DB
brew install node                      # for esbuild/npm
```

### PostgreSQL gotchas (Homebrew on Intel Mac)

After install, two symlinks are needed because Homebrew names the dirs `postgresql` but the binary expects `postgresql@18`:

```sh
ln -s /usr/local/lib/postgresql /usr/local/lib/postgresql@18
ln -s /usr/local/share/postgresql /usr/local/share/postgresql@18
```

Initialise the data directory and start:

```sh
initdb /usr/local/var/postgresql@18
brew services start postgresql@18
```

Create the `postgres` superuser (Homebrew inits as your own username):

```sh
psql -U tomwoj -d postgres -c "CREATE USER postgres WITH SUPERUSER;"
```

PostgreSQL bin dir also needs to be on PATH — add to `~/.zshrc`:

```sh
export PATH="/usr/local/opt/postgresql@18/bin:$PATH"
```

## LuaRocks packages

Needs to target OpenResty's LuaJIT, not system Lua:

```sh
luarocks --lua-dir=/usr/local/opt/openresty/luajit install lapis
luarocks --lua-dir=/usr/local/opt/openresty/luajit install bcrypt
luarocks --lua-dir=/usr/local/opt/openresty/luajit install tableshape
```

## Shell profile (zsh)

Add both of these to `~/.zshrc` (already done on this machine):

```zsh
export PATH="/usr/local/opt/postgresql@18/bin:$PATH"
eval $(luarocks --lua-dir=/usr/local/opt/openresty/luajit path)
```

The `eval` sets `LUA_PATH`/`LUA_CPATH` so OpenResty can find lapis/bcrypt/etc. Without it `require "lapis"` fails at runtime. Run `source ~/.zshrc` or open a new terminal after editing.

## DB setup

```sh
make init_schema   # createdb + loads schema.sql
make migrate
```

## Frontend

```sh
npm install
make build   # compiles .moon → .lua AND bundles JS (run this first)
make watch   # JS only, rebuilds on save (use while developing)
```

`make build` must be run at least once before `lapis server` — it compiles all MoonScript files to Lua, without which the app 500s immediately.

## Running the app

```sh
lapis server   # starts on port 9090 (check config.moon) — actually binds 8080 in dev
lapis term     # stops it
```

## Notes

- OpenResty installs to `/usr/local/opt/openresty` on Intel Macs
- `nginx.conf` uses `${{PORT}}` template — actual port is in `config.moon` (9090 for dev) but the compiled config may bind 8080; check `nginx.conf.compiled` if unsure
- The Dockerfile in the repo is CI-only — not useful for local dev
- Tup build system is no longer needed; `make build` replaces it entirely
