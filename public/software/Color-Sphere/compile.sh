#!/bin/bash

# gather scripts from source
find source/js -name '*.js' -print0 | while read -d $'\0' file
	do cat $file >> ./source/script.txt
	done

# gather scripts from source
find source/media/css -name '*.css' -print0 | while read -d $'\0' file
	do cat $file >> ./source/style.css
	done

# run the scripts through closure compiler
java -jar ../../inc/closure.jar --js ./source/script.txt --js_output_file ./source/script.js

# change links on the app.html to reflect the compilation
sed '/<!--- start -->/,/<!--- end -->/d' ./source/index.html | 
sed 's/<!--- Color Sphere -->/<script src=".\/script.js" type="text\/javascript"><\/script><link href=".\/style.css" rel="stylesheet" type="text\/css"\/>/g' > ./source/app.html

# package
zip -r color-sphere.zip ./source/media/images
zip -r color-sphere.zip ./source/style.css
zip -r color-sphere.zip ./source/script.js
zip -r color-sphere.zip ./source/manifest.json
zip -r color-sphere.zip ./source/app.html

# remove tmp files
#rm ./source/app.html
#rm ./source/style.css
#rm ./source/script.js
rm ./source/script.txt