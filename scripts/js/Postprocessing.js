function Postprocessing(SCENE, CAMERA, RENDERER){
	this.scene = SCENE;
	this.camera = CAMERA;
	this.renderer = RENDERER;
	this.buffers = [];

	this.init = function(){
		this.buffers[0] = new RenderBuffer(new MaskShader(), false);
        this.buffers[1] = new RenderBuffer(new PassShader(), false);
		this.buffers[2] = new RenderBuffer(new CombineShader(), postScene);
		this.extraBuffer = new THREE.WebGLRenderTarget(renderSize.x, renderSize.y);
		this.extraBuffer.texture.minFilter = THREE.LinearFilter;
		this.extraBuffer.texture.magFilter = THREE.LinearFilter;
		this.extraBuffer.texture.format = THREE.RGBAFormat;
        this.buffers[0].material.uniforms["texture_mask"].value = maskRenderTarget;
        this.buffers[0].material.uniforms["texture_render"].value = renderTarget;
		this.buffers[0].material.uniforms["texture"].value = renderTarget;
		this.buffers[0].material.uniforms["BUF_A"].value = this.buffers[1].renderTarget;
        this.buffers[1].material.uniforms["texture"].value = this.buffers[0].renderTarget;
        this.buffers[2].material.uniforms["texture_render"].value = renderTarget;
		this.buffers[2].material.uniforms["texture_mask"].value = this.buffers[1].renderTarget;

	}
	this.resize = function() {
	    for (var i = 0; i < this.buffers.length; i++) {
	        this.buffers[i].renderTarget.setSize(renderSize.x, renderSize.y);
	    }
	}
	this.update = function(){
		this.swapBuffers(); 
        this.buffers[0].material.uniforms["BUF_A"].value = this.buffers[1].renderTarget;
		this.buffers[0].render(this.renderer, this.camera, true);
        this.buffers[1].render(this.renderer, this.camera, true);
		this.buffers[2].render(this.renderer, this.camera, false);
	}
    this.swapBuffers = function() {
        var a = this.buffers[1].renderTarget;
        this.buffers[1].renderTarget = this.buffers[0].renderTarget;
        this.buffers[0].renderTarget = a;
    };
    this.setUniforms = function(UNIFORMS) {
        for(u in UNIFORMS){
            for (var i = 0; i < this.buffers.length; i++) {
                if (this.buffers[i].material.uniforms[u]) this.buffers[i].material.uniforms[u].value = UNIFORMS[u];     
            }
        }

    };
    this.dispose = function() {
        for (var i = 0; i < this.buffers.length; i++) {
            this.buffers[i].dispose();
        }
        this.material.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };

}
function RenderBuffer(SHADER, SCENE) {
    if(SCENE){
        this.scene = SCENE;
    } else {
        this.scene = new THREE.Scene();
    }

    this.renderTarget, this.shader, this.material, this.geometry, this.mesh;
    this.initialize = function(SHADER) {
        this.renderTarget = new THREE.WebGLRenderTarget(renderSize.x, renderSize.y);
        this.renderTarget.texture.minFilter = THREE.NearestFilter;
        this.renderTarget.texture.magFilter = THREE.NearestFilter;
        this.renderTarget.texture.format = THREE.RGBAFormat;
        this.renderTarget.texture.wrapS = THREE.RepeatWrapping;
        this.renderTarget.texture.wrapT = THREE.RepeatWrapping;
        this.shader = SHADER;
        this.material = new THREE.ShaderMaterial({
            uniforms: this.shader.uniforms,
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader,
            transparent: true
        });
        this.geometry = new THREE.PlaneGeometry(2,2);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
    };
    this.initialize(SHADER);
    this.render = function(RENDERER, CAMERA, TO_TARGET) {
        if(TO_TARGET){
            RENDERER.render(this.scene, CAMERA, this.renderTarget);            
        } else {
            RENDERER.render(this.scene, CAMERA);            
        }
    };
    this.dispose = function() {
        this.renderTarget.dispose();
        this.material.dispose();
        this.material.uniforms.texture.value.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };
}
function PassShader(){
        this.uniforms = THREE.UniformsUtils.merge([
            {
                "texture"  : { type: "t", value: null },
                "mouse"  : { type: "v2", value: null },
                "resolution"  : { type: "v2", value: null },
                "time"  : { type: "f", value: 0.0 }
            }
        ]);

        this.vertexShader = [

            "varying vec2 vUv;",
            "void main() {",
            "    vUv = uv;",
            "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        
        ].join("\n");
        
        this.fragmentShader = [

            "uniform vec2 resolution;",
            "uniform vec2 mouse;",
            "uniform sampler2D texture;",

            "uniform float time;",
            "varying vec2 vUv;",

            "void main() {",
            "	gl_FragColor = texture2D(texture, vec2(vUv.x, vUv.y));",
            "}",


        
        ].join("\n");
}
function MaskShader(){
        this.uniforms = THREE.UniformsUtils.merge([
            {
                "mouse"  : { type: "v2", value: null },
                "resolution"  : { type: "v2", value: null },
                "time"  : { type: "f", value: 0.0 },
                "texture"  : { type: "t", value: null },
                "texture_render"  : { type: "t", value: null },
                "texture_mask"  : { type: "t", value: null },
                "BUF_A"  : { type: "t", value: null },
            }
        ]);

        this.vertexShader = [

            "varying vec2 vUv;",
            "void main() {",
            "    vUv = uv;",
            "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        
        ].join("\n");
        
        this.fragmentShader = [

            "uniform vec2 resolution;",
            "uniform vec2 mouse;",
            "uniform sampler2D texture;",
            "uniform sampler2D texture_render;",
            "uniform sampler2D texture_mask;",
            "uniform sampler2D BUF_A;",
            "uniform float time;",
            "varying vec2 vUv;",
           
            "void main() {",
         //    "	vec4 white = vec4(texture2D(white, vUv).rgb, 1.0);",
/*            "	vec4 tex = vec4(texture2D(texture, vUv).rgb, 1.0);",

            "    vec2 uv = vUv;",
            "	vec2 uv0 = (uv-0.5)*(0.9+0.1*sin(time))+0.5;",
            "	vec4 c_t0 = texture2D( BUF_A, uv0)*vec4(1.0,0.0,0.0,1.0);",

        	"	gl_FragColor = 0.05*c_t0 + 0.95*tex;",*/
        	// "	gl_FragColor =c_t;",
	    	"	vec2 px = 2.0/resolution.xy;",
			"	vec2 uv = vUv;",
            "   vec4 tex = texture2D(texture,uv);",
			"	vec4 mask = texture2D(texture,uv);",
			"	mask.g *= 1.0;",
			"	float newG = min((1.0 - mask.g),max(mask.r,mask.b));",
			"	float d = abs((1.0 - mask.g) - newG);",
			// "	tex.g = newG;",
			"	{",
			"	     //px*= sin(time+uv.yx*3.0)*.35;",
			"	     uv -= 0.5*px;",
			"	     vec4 tex2 = texture2D(BUF_A, uv);",
			"	     uv += px;",
			"	     tex2 += texture2D(BUF_A, uv);",
			"	     uv.y -= px.y;",
			"	     tex2 += texture2D(BUF_A, uv);",
			"	     uv.x -= px.x-.008 *mouse.x;//sin(time*.1);",
			"	     uv.y += px.y+.005 * mouse.y;//cos(time*.1);",
			"	     tex2 += texture2D(BUF_A, uv);",
			"	     tex2 /= 4.013;",
			"	     tex2 = clamp(tex2*1.02-0.012,0.0,1.0);",
			"	     tex = max(clamp(tex*(1.0-d),0.0,1.0),mix(tex,tex2,smoothstep(-0.4,0.23,d)));",
			"	  }",
			"	     ",
            "   gl_FragColor = tex;//mix(tex, texture2D(texture, vUv), texture2D(texture_mask, vUv).g);",
            "}",


        
        ].join("\n");
}

function CombineShader(){
        this.uniforms = THREE.UniformsUtils.merge([
            {
                "mouse"  : { type: "v2", value: null },
                "resolution"  : { type: "v2", value: null },
                "time"  : { type: "f", value: 0.0 },
                "texture"  : { type: "t", value: null },
                "texture_render"  : { type: "t", value: null },
                "texture_mask"  : { type: "t", value: null },
                "BUF_A"  : { type: "t", value: null },
            }
        ]);

        this.vertexShader = [

            "varying vec2 vUv;",
            "void main() {",
            "    vUv = uv;",
            "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        
        ].join("\n");
        
        this.fragmentShader = [

            "uniform vec2 resolution;",
            "uniform vec2 mouse;",
            "uniform sampler2D texture;",
            "uniform sampler2D texture_render;",
            "uniform sampler2D texture_mask;",
            "uniform sampler2D BUF_A;",
            "uniform float time;",
            "varying vec2 vUv;",
           
            "void main() {",

            "   vec2 uv = vUv;",
            "   vec4 tex = texture2D(texture_render,uv);",
            "   vec4 mask = texture2D(texture_mask,uv);",

            "   gl_FragColor = mask*1.2;",
            "}",


        
        ].join("\n");
}
