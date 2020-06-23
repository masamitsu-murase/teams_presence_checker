
cd /D "%~dp0"

cd vue_template
%ComSpec% /c npx.cmd webpack --mode production
copy /Y dist\popup_vue.js ..\extension\js\popup\popup_vue.js
cd ..
