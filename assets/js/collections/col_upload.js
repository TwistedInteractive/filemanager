(function(a,b){a(["jquery","underscore","backbone","collections/col_general","modules/mod_async_upload","modules/mod_byteconverter"],function(a,c,d,e,f,g){function n(a){a===this&&this.trigger("destroyed",this)}function m(a){a.fail(c.bind(k,this)).done(c.bind(l,this));return a}function l(a,b){b==="success"&&this.trigger("success",this,a)}function k(b,c){c==="abort"&&this.trigger("cancled",this),c==="error"&&this.trigger("error",this,a.parseJSON(b.responseText))}var h,i,j;i=d.Model.extend({initialize:function(){this.collection.trigger("create",this),window._m=this,this.collection.on("remove",c.bind(n,this))},parse:function(a){},url:function(){return this.collection.url+"?field_id="+this.get("field_id")},defaults:{context:"",file:[],originalFiles:[],form:"",name:undefined,size:0,type:undefined,id:undefined,field_id:undefined},_createSendData:function(){return{file:this.get("file")}},_filter:function(a,b){var d=b.split(" "),e={};c.each(a,function(a,b){c.include(d,b)&&(e[b]=a)});return e},send:function(){var a=new f({url:this.url()});a.on("progress",c.bind(this._onProgress,this)),this._upload=m.call(this,a.send(this._filter(this.toJSON(),"file context form")))},_onProgress:function(a,b){this.trigger("progress",Math.floor(a/b*100))},_onSuccess:function(){}}),j=function(){function p(a){alert(a)}function o(a){!a.name&&a.fileName&&(a.name=a.fileName),!a.size&&a.fileSize&&(a.size=a.fileSize);return a}function n(b){a[this.cid].push(b),this.trigger("push")}function m(a){d[this.cid].push(a),this.trigger("push")}function l(a){var b=d[this.cid],e=c.indexOf(b,a);e>-1&&(b.splice(e,1),this.trigger("flush"))}function k(b){var d=a[this.cid],e=c.indexOf(d,b);e>-1&&(d.splice(e,1),this._uploads--,this.trigger("flush"))}function j(a){var b=this,d=[],e=c.toArray(a[0].files);e.length||e.push({name:a[0].value.replace(/^.*\\/,"")}),c.each(e,function(i,j,k){var l=c.clone(b.model.prototype.defaults);i.type&&!f.call(b,i.type)?(e[j]=null,e.splice(j,1),b.trigger("invalidtype",i.name||i.fileName,i.type)):i.size&&!h.call(b,i.size)?(e[j]=null,e.splice(j,1),b.trigger("filesizeexceeds",i.name||i.fileName,i.size)):(l.form=a,l.file=i,l.originalFiles=k,l.name=i.name||i.fileName,l.size=g(i.size||i.fileSize),l.type=i.type,l.id=c.uniqueId(),d.push(l))});return d}function h(a){return parseInt(this.settings.max_file_size,10)<a?!1:!0}function f(a){return a.match(this.settings.allowed_types)?!0:!1}var a={},d={};return e.extend({events:{error:"_onError"},initialize:function(){this.cid=this.cid||"c"+c.uniqueId(),d[this.cid]=[],a[this.cid]=[],this.on("add",c.bind(n,this)),this.on("remove",c.bind(k,this))},url:b.Context.get("root")+"/symphony/extension/filemanager/upload/",model:i,addItem:function(a){var b=j.call(this,a);this.add(b)},removeItem:function(a){this.remove(a)},update:function(a,b){var d=this,e;c.isArray(b)?c.each(b,function(b){d.update(a,b)}):(e=this.get(a),e.set(b))},send:function(a){var b=this.get(a),d;b.on("success",c.bind(this.update,this)).on("success error cancled",c.bind(l,this)),d=b.send(),m.call(this,b),k.call(this,b);return b._upload},cancel:function(a){var b=this.get(a);if(b._upload&&!b._upload.isResolved()){b._upload.abort(),n.call(this,b);return!0}return!1},hasActiveUploads:function(){return!!d[this.cid].length},hasPendingUploads:function(){return!!a[this.cid].length}})}(),h=e.extend({constructors:{UploadList:j},addList:function(){var a=new j;c.each(this.settings,function(b,c){a.addSetting(c,b,!0)});return a},initialize:function(){this.settings=c.extend({},h.defaults)}}),h.defaults={field_id:null,allowed_types:["image/jpeg"]};return h})})(this.define,this.Symphony)