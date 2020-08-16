#!/bin/bash -e

test -e public && rm -r public
mkdir public

echo $(grep -v 'clientJS' src/index.html) > public/index.html
sed -ri '
  s#</body>#<script src="client.js"></script></body>#;
  s#\s*/>#/>#g;
  s#>\s*<#><#g;
' public/index.html
sed -ri 's#<!DOCTYPE html>#<!DOCTYPE html>\n#' public/index.html

STYLE="$(
echo -n $(sed -r '
  s/\*/ASTERISK/g;
  s/([-a-z0-9])\s+([-#.a-z0-9])/\1|\2/g;
  s/([-a-z0-9])\s+([-#.a-z0-9])/\1|\2/g;
' src/style.css) |
sed -r '
  s/ASTERISK/*/g;
  s/\s+//g;
  s/\|/ /g;
  s/;\}/}/g;
')"

sed -ri "s|<link .*href=\"style.css\">|<style>$STYLE</style>|" public/index.html

echo "(()=>{ $(cat src/server.js) })()" |
terser --compress --mangle > public/server.js

echo "(()=>{$(
  grep 'clientJS' src/index.html    |
  sed -r 's#.*src="(.*)".*#src/\1#' |
  xargs cat
)})()" |
terser --compress --mangle |
sed -r 's/\b(function|const|var|let|if\()/\n\1/g' > public/client.js

terser src/shared.js --compress --mangle > public/shared.js

if [ "$1" = "start" ]; then
  sync
  exec npm start
else
  echo Done.
fi
