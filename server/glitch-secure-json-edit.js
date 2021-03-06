const secureJSON = require("glitch-secure-json");
const jsonEditor = require("json-edit");
const fs = require('fs'),path = require('path');
const applyHysteresis = require(path.join(path.dirname(require.resolve("json-edit")),'..','public','hysteresis.js')).applyHysteresis;

function secureJSONEditor(app,express,server,filename,displayName,template,route,theme) {
   let obj;
  try {
    obj = secureJSONEditor.JSON.parse(fs.readFileSync(filename,'utf8'));
  } catch (e) {
    obj = JSON.parse(JSON.stringify(template));
  }
  

  
   if (!route) {
     route = path.basename(filename);
     if (route.endsWith('.json')) {
        route=route.substr(0,route.length-5);
     }
     if (!theme) {
       theme='cobalt';
     }
   }
   const editor = jsonEditor(app, express, server,  obj, displayName, template, route, theme) ;  
  
  
   editor.addEventListener("change",applyHysteresis(function(e){
     let obj = e.current;
     editor.emit("save",{fs:path.basename(filename)});
     fs.writeFile(filename,secureJSONEditor.JSON.stringify(obj), function(){
        editor.emit("save",{done:editor.current});
     });
   },1000,function(e){
       editor.emit("save",{changed:true});
   }));
  
  
  const implementation = {
       
   };
  
   Object.defineProperties(editor,implementation);

   return editor;
}
secureJSONEditor.JSON = secureJSON;

module.exports = secureJSONEditor;
