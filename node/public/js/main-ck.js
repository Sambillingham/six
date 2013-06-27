(function(){function P(){t.add(e);t.fog=new THREE.Fog(0,1800,3e3);n.setSize(w,E);document.body.appendChild(n.domElement);window.addEventListener("resize",H,!1);k[0]=new R("Phil",10,Math.floor(Math.random()*360),0,0,0);k[1]=new R("Sam",7,Math.floor(Math.random()*360),0,0,0);k[2]=new R("Luke",4,Math.floor(Math.random()*360),0,0,0);k[3]=new R("Chris",9,Math.floor(Math.random()*360),0,0,0);console.log(UserMaxConnection[0].max,UserMaxConnection[1].max,UserMaxConnection[2].max,UserMaxConnection[3].max);J();U();B()}function H(){e.aspect=window.innerWidth/window.innerHeight;e.updateProjectionMatrix();n.setSize(window.innerWidth,window.innerHeight)}function B(){renderPass=new THREE.RenderPass(t,e);copyPass=new THREE.ShaderPass(THREE.CopyShader);vignettePass=new THREE.ShaderPass(THREE.VignetteShader);vignettePass.uniforms.darkness.value=1.5;composer=new THREE.EffectComposer(n);composer.addPass(renderPass);composer.addPass(vignettePass);composer.addPass(copyPass);copyPass.renderToScreen=!0}function F(){var e=new THREE.PointLight(16777215);e.position.x=10;e.position.y=50;e.position.z=130;t.add(e);t.add(new THREE.AmbientLight(14272089));var n=new THREE.DirectionalLight(16777215,.55,500);t.add(n);var r=new THREE.DirectionalLight(16777215,.25,500);r.position.set(0,0,1).normalize();t.add(r)}function I(){plane=new THREE.Mesh(new THREE.PlaneGeometry(3e3,3e3,20,20),new THREE.MeshLambertMaterial({ambient:197379,color:3355443,shading:THREE.FlatShading,opacity:1,transparent:!1,wireframe:!1,blending:THREE.AdditiveBlending}));plane.rotation.x=-Math.PI/2;plane.position.y=-50;t.add(plane);for(var e=0;e<441;e++){var n=Math.floor(Math.random()*400-600);plane.geometry.vertices[e].z=n}}function q(){var e="Phil",n=document.location.hash.substr(1);n.length!==0&&(e=n);var r=new THREE.TextGeometry(e,{size:30,height:20,curveSegments:2,font:"helvetiker"});r.computeBoundingBox();var i=-0.5*(r.boundingBox.max.x-r.boundingBox.min.x),s=new THREE.MeshBasicMaterial({color:16777215,overdraw:!0,shading:THREE.FlatShading});_=new THREE.Mesh(r,s);_.position.x=Math.cos(i);_.position.y=60;_.position.z=Math.sin(i);D=new THREE.Object3D;D.add(_);t.add(D)}function R(e,n,r,i,s,o){this.sId=e;this.sRadius=n;this.sAngle=r;this.sX=i;this.sX=s;this.sX=o;var u=new THREE.MeshLambertMaterial({ambient:16777215,color:16777215,specular:0,shininess:0,shading:THREE.FlatShading,opacity:1,transparent:!0}),a=new THREE.SphereGeometry(n,6,6);this.sphere=new THREE.Mesh(a,u);this.sphere.position.x=i;this.sphere.position.y=s;this.sphere.position.z=o;t.add(this.sphere)}function U(){var e=new Array;for(var t=0;t<k.length;t++){var n=0;for(var r=0;r<k.length;r++)t!=r&&k[t].sRadius<k[r].sRadius&&n++;e[n]=k[t];fromPosX=k[t].sphere.position.x;fromPosY=0;fromPosZ=k[t].sphere.position.z;toPosX=z(n,k[t].sAngle);toPosY=0;toPosZ=W(n,k[t].sAngle);K(k[t],fromPosX,fromPosY,fromPosZ,toPosX,toPosY,toPosZ)}}function z(e,t){hyp=e*(800/k.length);return Math.cos(t)*hyp}function W(e,t){hyp=e*(800/k.length);return Math.sin(t)*hyp}function X(e,n,r){this.sphereA=e;this.sphereB=n;var i=new THREE.Vector3(e.sphere.position.x,e.sphere.position.y,e.sphere.position.z),s=new THREE.Vector3(n.sphere.position.x,n.sphere.position.y,n.sphere.position.z),o=new THREE.Geometry;o.vertices.push(i);o.vertices.push(s);o.verticesNeedUpdate=!0;var u=new THREE.LineBasicMaterial({color:16777215,transparent:!0,opacity:r,linewidth:1});this.line=new THREE.Line(o,u);this.line.geometry.verticesNeedUpdate=!0;t.add(this.line)}function V(){for(var e=0;e<k.length;e++){var n=k[e].sId,r=k[e].sAngle,i=k[e].sphere.position.x,s=k[e].sphere.position.y,o=k[e].sphere.position.z,u=UserMaxConnection[e].max;t.remove(k[e].sphere);k[e]=new R(n,u,r,i,s,o)}for(var e=0;e<L.length;e++)t.remove(L[e].line);J();U()}function J(){var e=0;for(var t=k.length-1;t>0;t--)for(var n=t-1;n>=0;n--){var r=Math.random();L[e]=new X(k[t],k[n],r);e++}}function K(e,t,n,r,i,s,o){var u=function(){e.sphere.position.x=a.x;e.sphere.position.y=a.y;e.sphere.position.z=a.z},a={x:t,y:n,z:r},f=TWEEN.Easing.Quintic.EaseInOut,l=(new TWEEN.Tween(a)).to({x:i,y:s,z:o},O).delay(M).easing(f).onUpdate(u).start()}function Q(){for(var e=0;e<L.length;e++){var t=L[e].sphereA.sphere.position,n=L[e].sphereB.sphere.position;L[e].line.geometry.vertices[0].set(t.x,t.y,t.z);L[e].line.geometry.vertices[1].set(n.x,n.y,n.z);L[e].line.geometry.verticesNeedUpdate=!0}}function G(){TWEEN.removeAll();V();okayToUpdate=!1;Y()}function Y(){setTimeout(function(){okayToUpdate=!0},2e3)}function Z(r){var i=Date.now()*2e-4;if(C){e.position.x=Math.cos(i)*1500;e.position.z=Math.sin(i)*1500}Q();e.lookAt(t.position);n.render(t,e);requestAnimationFrame(Z);TWEEN.update();composer.render(.1)}$("#toggle-stats").click(function(){$(".stats").toggle()});var e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m=!0;mouseX=0,mouseY=0,okayToUpdate=!0,UserMaxConnection=[{id:0,max:0},{id:1,max:0},{id:2,max:0},{id:3,max:0}],relationshipsDbInsert=[{conId:1,relationship:0},{conId:2,relationship:0},{conId:3,relationship:0},{conId:4,relationship:0},{conId:5,relationship:0},{conId:6,relationship:0}],allViewArray=[],allViewArrayRel=[],useLiveData=!0,useAllData=!1,intervalTimerId=0,intervalTimerIdRelationship=0,index=0,indexRel=0,indexCheck=!1,indexRelCheck=!1;$("#usersWindow").click(function(){$("#usersWindow").toggleClass("userWindowActive")});$("#relationshipWindow").click(function(){$("#relationshipWindow").toggleClass("relationshipWindowActive")});$("#all-view").click(function(){index=0;indexRel=0;useLiveData=!1;useAllData=!0;b.emit("all-view-request");console.log("All view has been selected and socket request sent to server");$("#all-view").addClass("view-button-active");$("#live-view").removeClass("view-button-active");$("#more-view").removeClass("view-button-active")});$("#live-view").click(function(){useLiveData=!0;useAllData=!1;$("#live-view").addClass("view-button-active");$("#all-view").removeClass("view-button-active");$("#more-view").removeClass("view-button-active");clearInterval(intervalTimerId);clearInterval(intervalTimerIdRelationship)});$("#circle-buzz").click(function(){console.log("Circle buzz Click");b.emit("circlebuzz",1)});$("#front-back-buzz").click(function(){console.log("FB Buzz Click");b.emit("fbbuzz",1)});$("#all-buzz").click(function(){console.log("ALL Buzz Click");b.emit("allbuzz",1)});var g="",y={};maxConnection={};var b=io.connect("six.sambillingham.com");index=0;indexRel=0;useLiveData=!1;useAllData=!0;b.emit("all-view-request");console.log("All view has been selected and socket request sent to server");$("#all-view").addClass("view-button-active");$("#live-view").removeClass("view-button-active");$("#more-view").removeClass("view-button-active");b.on("relationshipConnections",function(e){y=e;if(useLiveData!=undefined)for(var t=1;t<7;t++)if(y.conId===t){j=t-1;relationshipsDbInsert[j].conId=y.conId;relationshipsDbInsert[j].relationship=y.relationship;$("#rel"+t).html("Relationship ID "+t+"'s connection is "+y.relationship)}});b.on("maxConnection",function(e){maxConnection=e;if(useLiveData!=undefined)for(var t=0;t<4;t++)if(maxConnection.id===t){UserMaxConnection[t].id=maxConnection.id;UserMaxConnection[t].max=maxConnection.max;okayToUpdate===!0&&G();$("#user"+t).html("Max Connection for ID "+t+" = "+maxConnection.max)}});b.on("all-view-data-user",function(e){allViewArray=JSON.parse(e);if(useAllData===!0){function t(){if(indexCheck===!1){index=allViewArray.length-1;indexCheck=!0}index===0?indexCheck=!1:index-=1;for(var e=0;e<4;e++){console.log(index,"  ",allViewArray[index]);if(allViewArray[index].id===e){UserMaxConnection[e].id=allViewArray[index].id;UserMaxConnection[e].max=allViewArray[index].max;okayToUpdate===!0&&G()}}}t();intervalTimerId&&clearInterval();intervalTimerId=setInterval(t,2500)}});b.on("all-view-data-relationship",function(e){allViewArrayRel=JSON.parse(e);if(useAllData===!0){function t(){if(indexRelCheck===!1){indexRel=allViewArrayRel.length-1;indexRelCheck=!0}indexRel===0?indexRelCheck=!1:indexRel-=1;for(var e=0;e<4;e++){console.log(indexRel,"  ",allViewArrayRel[indexRel]);if(allViewArrayRel[indexRel].conId===e){relationshipsDbInsert[e].conId=allViewArrayRel[indexRel].conId;relationshipsDbInsert[e].relationship=allViewArrayRel[indexRel].relationship;okayToUpdate===!0&&G()}}}t();intervalTimerIdRelationship&&clearInterval(intervalTimerIdRelationship);intervalTimerIdRelationship=setInterval(t,2300)}});b.on("testingTopic",function(e){$("#latestInput").html(e)});setTimeout(function(){console.log(UserMaxConnection[0].max,UserMaxConnection[1].max,UserMaxConnection[2].max,UserMaxConnection[3].max)},1e3);var w=window.innerWidth,E=window.innerHeight-95,S=45,x=w/E,T=.1,N=1e4,n=new THREE.WebGLRenderer,e=new THREE.PerspectiveCamera(S,x,T,N);e.position.set(0,600,0);var C=!0,t=new THREE.Scene,k=new Array,L=new Array,A=new Array,O=2500,M=0,_,D;setTimeout(function(){P();F();I();Z()},5e3)})();