import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../Experience.js';
import floorVert from '../Shaders/floorVert.glsl';
import floorFrag from '../Shaders/floorFrag.glsl';

export default class Object
{
    constructor()
    {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;
        this.time = this.experience.time;
        this.loading = this.experience.loading;
        this.renderer = this.experience.renderer;

        this.params = {
            Podium_Animation: () => {
                this.podiumOpenAnimation();
            },
            Light_Mode: () => {
                this.enterLightMode();
            },
            Dark_Mode: () => {
                this.enterDarkMode();
            },
        };

        if(this.debug.active)
        {
            this.dotsDebugFolder = this.debug.ui.addFolder('dots');
            this.floorDebugFolder = this.debug.ui.addFolder('floor');
            this.podiumDebugFolder = this.debug.ui.addFolder('podium');
            this.globalDebugFolder = this.debug.ui.addFolder('global');
            this.dotsDebugFolder.close();
            this.floorDebugFolder.close();
            this.podiumDebugFolder.close();
            this.globalDebugFolder.close();

            this.debug.ui.add(this.params, 'Light_Mode');
            this.debug.ui.add(this.params, 'Dark_Mode');
        }

        this.setFloor();
        this.setShadowPlane();
        this.setCharacter();
        this.setCap();
    }

    setFloor()
    {
        this.params.floorColorLight = '#fafafa';
        this.params.floorColorDark = '#212121';

        this.params.dotsColorLight = '#dddfe4';
        this.params.dotsColorDark = '#333333';

        this.params.podiumRingColorLight = '#ffffff';
        this.params.podiumRingColorDark = '#292929';
        this.params.podiumCentreColorLight = '#fafafa';
        this.params.podiumCentreColorDark = '#292929';
        this.params.podiumRadius = 0.022;
        this.params.podiumPulseAmplitude = 0.001;
        this.params.podiumPulseFrequency = 2;
        
        const floorGeo = new THREE.PlaneGeometry(10, 10, 1, 1);
        this.floorMat = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: floorVert,
            fragmentShader: floorFrag,
            uniforms:
            {
                uFloorColor: { value: new THREE.Color(this.params.floorColorLight) },
                uFloorRadius: { value: 0.2 },
                uFloorPower: { value: 1 },
                uFresnelPower: { value: 20 },

                uDotsColor: { value: new THREE.Color(this.params.dotsColorLight) },
                uGridScale: { value: 301 },
                uDotRadius: { value: 0.08 },

                uRingColor: { value: new THREE.Color(this.params.podiumRingColorLight) },
                uCentreColor: { value: new THREE.Color(this.params.podiumCentreColorLight) },
                uPodiumRadius: { value: 0 },
                uRingThickness: { value: 0.0008 },
                uCentreOpacity: { value: 0.6 },
            },
        });
        const floorMesh = new THREE.Mesh(floorGeo, this.floorMat);
        floorMesh.rotation.x = Math.PI * -0.5;
        floorMesh.position.y = -0.2;
        floorMesh.renderOrder = 1;
        this.scene.add(floorMesh);

        // Debug
        if(this.debug.active)
        {
            // Floor
            this.floorDebugFolder.addColor(this.params, 'floorColorLight').name('floorColor').onChange(() =>
            {
                (this.floorMat.uniforms.uFloorColor.value.set(this.params.floorColorLight));
            });
            this.floorDebugFolder.add(this.floorMat.uniforms.uFloorRadius, 'value')
                .min(0).max(0.5).step(0.01).name('floorRadius');
            this.floorDebugFolder.add(this.floorMat.uniforms.uFloorPower, 'value')
                .min(0).max(10).step(0.01).name('floorPower');
            this.floorDebugFolder.add(this.floorMat.uniforms.uFresnelPower, 'value')
                .min(0).max(100).step(0.01).name('fresnelPower');

            // Dots
            this.dotsDebugFolder.addColor(this.params, 'dotsColorLight').name('dotsColor').onChange(() =>
            {
                (this.floorMat.uniforms.uDotsColor.value.set(this.params.dotsColorLight));
            });
            this.dotsDebugFolder.add(this.floorMat.uniforms.uDotRadius, 'value')
                .min(0).max(0.5).step(0.001).name('dotRadius');
            this.dotsDebugFolder.add(this.floorMat.uniforms.uGridScale, 'value')
                .min(1).max(500).step(1).name('gridScale');

            // Podium
            this.podiumDebugFolder.add(this.params, 'Podium_Animation');
            this.podiumDebugFolder.addColor(this.params, 'podiumRingColorLight').name('podiumRingColor').onChange(() =>
            {
                this.floorMat.uniforms.uRingColor.value.set(this.params.podiumRingColorLight);
            });
            this.podiumDebugFolder.addColor(this.params, 'podiumCentreColorLight').name('podiumCentreColor').onChange(() =>
            {
                this.floorMat.uniforms.uCentreColor.value.set(this.params.podiumCentreColorLight);
            });
            this.podiumDebugFolder.add(this.params, 'podiumRadius').min(0).max(0.1).step(0.001).name('podiumRadius').onChange(() =>
            {
                this.floorMat.uniforms.uPodiumRadius.value = this.params.podiumRadius;
            });
            this.podiumDebugFolder.add(this.floorMat.uniforms.uRingThickness, 'value')
                .min(0).max(0.005).step(0.0001).name('ringThickness');
            this.podiumDebugFolder.add(this.floorMat.uniforms.uCentreOpacity, 'value')
                .min(0).max(1).step(0.001).name('centreOpacity');
            this.podiumDebugFolder.add(this.params, 'podiumPulseAmplitude')
                .min(0).max(0.1).step(0.001).name('pulseAmplitude');
            this.podiumDebugFolder.add(this.params, 'podiumPulseFrequency')
                .min(0).max(5).step(0.1).name('pulseFrequency');
        };
    }

    podiumOpenAnimation(_delay)
    {
        gsap.killTweensOf(this.floorMat.uniforms.uPodiumRadius);
        this.floorMat.uniforms.uPodiumRadius.value = 0;
        gsap.to(this.floorMat.uniforms.uPodiumRadius, {
            value: this.params.podiumRadius,
            duration: 1.2,
            delay: _delay,
            ease: 'elastic.out(0.3, 0.2)',
            callbackScope: this,
            onComplete: function() { this.podiumPulseAnimation() },
        });
    }

    podiumPulseAnimation()
    {
        gsap.to(this.floorMat.uniforms.uPodiumRadius, {
            value: this.params.podiumRadius + this.params.podiumPulseAmplitude,
            duration: this.params.podiumPulseFrequency,
            ease: 'sine.inOut',
            repeat: -1,
            repeatDelay: this.params.podiumPulseFrequency,
        });
        gsap.to(this.floorMat.uniforms.uPodiumRadius, {
            value: this.params.podiumRadius,
            duration: this.params.podiumPulseFrequency,
            delay: this.params.podiumPulseFrequency,
            ease: 'sine.inOut',
            repeat: -1,
            repeatDelay: this.params.podiumPulseFrequency,
        });
    }

    setShadowPlane()
    {
        this.params.shadowOpacity = 0.05;
        
        const shadowPlaneGeo = new THREE.PlaneGeometry(2, 2, 1, 1);
        const shadowPlaneMat = new THREE.ShadowMaterial({
            color: '#000000',
            opacity: this.params.shadowOpacity,
            transparent: true,
        });
        const shadowPlaneMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
        shadowPlaneMesh.rotation.x = Math.PI * -0.5;
        shadowPlaneMesh.position.y = -0.197;
        shadowPlaneMesh.receiveShadow = true;
        this.scene.add(shadowPlaneMesh);

        // Debug
        if(this.debug.active)
        {
            this.floorDebugFolder.add(this.params, 'shadowOpacity')
                .min(0).max(1).step(0.01).name('shadowOpacity').onChange(() =>
                {
                    shadowPlaneMat.opacity = this.params.shadowOpacity;
                });
        }
    }

    setCharacter()
    {
        this.params.animateCharacter = true;
        
        const characterResource = this.resources.items.characterModel;

        const character = characterResource.scene;
        character.scale.set(0.2, 0.2, 0.2);
        character.position.y = -0.2;
        character.rotation.y = Math.PI;

        this.scene.add(character);
        this.loading.character = character;

        character.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.renderOrder = 2;
                child.castShadow = true;
            }
        });

        this.animation = {};
        this.animation.mixer = new THREE.AnimationMixer(character);

        this.animation.actions = {};
        this.animation.actions.main = this.animation.mixer.clipAction(characterResource.animations[0]);
        
        this.animation.actions.main.play();

        if(this.debug.active)
        {
            this.globalDebugFolder.add(this.params, 'animateCharacter');
        }
    }

    setCap()
    {
        const capResource = this.resources.items.capModel;
        const cap = capResource.scene;
        cap.scale.set(0.02, 0.02, 0.02);
        // cap.position.y = 0.1;
        // cap.rotation.y = Math.PI;
        cap.visible = false;
        this.scene.add(cap);
        this.loading.cap = cap;

        cap.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true;
            }
        });
    }

    enterLightMode()
    {
        this.renderer.renderer.setClearColor(this.renderer.params.backgroundColorLight);
        this.floorMat.uniforms.uFloorColor.value.set(this.params.floorColorLight);
        this.floorMat.uniforms.uDotsColor.value.set(this.params.dotsColorLight);
        this.floorMat.uniforms.uRingColor.value.set(this.params.podiumRingColorLight);
        this.floorMat.uniforms.uCentreColor.value.set(this.params.podiumCentreColorLight);
    }

    enterDarkMode()
    {
        this.renderer.renderer.setClearColor(this.renderer.params.backgroundColorDark);
        this.floorMat.uniforms.uFloorColor.value.set(this.params.floorColorDark);
        this.floorMat.uniforms.uDotsColor.value.set(this.params.dotsColorDark);
        this.floorMat.uniforms.uRingColor.value.set(this.params.podiumRingColorDark);
        this.floorMat.uniforms.uCentreColor.value.set(this.params.podiumCentreColorDark);
    }

    update()
    {
        if(this.params.animateCharacter)
        {
            this.animation.mixer.update(this.time.delta * 0.0002);
        }
    }
}