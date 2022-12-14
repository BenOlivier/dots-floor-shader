import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../Experience.js';
import floorVert from '../Shaders/floorVert.glsl';
import floorFrag from '../Shaders/floorFrag.glsl';
import custoVert from '../Shaders/custoVert.glsl';
import custoFrag from '../Shaders/custoFrag.glsl';

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
        this.characterVisible = true;

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
            Reset_Params: () => {
                this.resetParams();
            },
        };

        if(this.debug.active)
        {
            this.floorDebugFolder = this.debug.ui.addFolder('floor');
            this.podiumDebugFolder = this.debug.ui.addFolder('podium');
            this.globalDebugFolder = this.debug.ui.addFolder('global');
            this.floorDebugFolder.close();
            this.podiumDebugFolder.close();
            this.globalDebugFolder.close();

            this.globalDebugFolder.add(this.params, 'Light_Mode');
            this.globalDebugFolder.add(this.params, 'Dark_Mode');
            this.globalDebugFolder.add(this.params, 'Reset_Params');
        }

        this.setFloor();
        this.setShadowPlane();
        this.setWatermark();
        this.setCharacter();
        // this.setCap();
    }

    setFloor()
    {
        this.params.showOffset = false;
        this.params.showUVs = false;
        this.params.showDots = true;
        this.params.showGradient = true;
        this.params.showFresnel = true;
        this.params.showPodium = true;
        
        this.params.floorColorLight = '#fafafa';
        this.params.floorColorDark = '#212121';

        this.params.dotsColorLight = '#dddfe4';
        this.params.dotsColorDark = '#333333';

        this.params.podiumColorLight = '#ffffff';
        this.params.podiumColorDark = '#292929';
        this.params.podiumRadius = 0.022;
        // this.params.podiumPulseAmplitude = 0.001;
        // this.params.podiumPulseFrequency = 2;
        
        const floorGeo = new THREE.PlaneGeometry(10, 10, 1, 1);
        this.floorMat = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: floorVert,
            fragmentShader: floorFrag,
            uniforms:
            {
                uFloorColor: { value: new THREE.Color(this.params.floorColorLight) },
                uFloorRadius: { value: 0.2 },
                uFresnelPower: { value: 20 },

                uDotsColor: { value: new THREE.Color(this.params.dotsColorLight) },
                uGridScale: { value: 301 },
                uDotRadius: { value: 0.08 },

                uPodiumColor: { value: new THREE.Color(this.params.podiumColorLight) },
                uPodiumRadius: { value: 0 },
                uRingThickness: { value: 0.0008 },
                uCentreOpacity: { value: 0.6 },

                uOffsetBool: { value: this.params.showOffset },
                uUVsBool: { value: this.params.showUVs },
                uDotsBool: { value: this.params.showDots },
                uGradientBool: { value: this.params.showGradient },
                uFresnelBool: { value: this.params.showFresnel },
                uPodiumBool: { value: this.params.showPodium },
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
            this.floorDebugFolder.add(this.floorMat.uniforms.uFresnelPower, 'value')
                .min(0).max(100).step(0.01).name('fresnelPower');

            // Dots
            this.floorDebugFolder.addColor(this.params, 'dotsColorLight').name('dotsColor').onChange(() =>
            {
                (this.floorMat.uniforms.uDotsColor.value.set(this.params.dotsColorLight));
            });
            this.floorDebugFolder.add(this.floorMat.uniforms.uDotRadius, 'value')
                .min(0).max(0.5).step(0.001).name('dotRadius');
            this.floorDebugFolder.add(this.floorMat.uniforms.uGridScale, 'value')
                .min(1).max(500).step(1).name('gridScale');

            // Podium
            this.podiumDebugFolder.add(this.params, 'Podium_Animation');
            this.podiumDebugFolder.addColor(this.params, 'podiumColorLight').name('podiumColor').onChange(() =>
            {
                this.floorMat.uniforms.uPodiumColor.value.set(this.params.podiumColorLight);
            });
            this.podiumDebugFolder.add(this.params, 'podiumRadius').min(0).max(0.1).step(0.001).name('podiumRadius').onChange(() =>
            {
                this.floorMat.uniforms.uPodiumRadius.value = this.params.podiumRadius;
            });
            this.podiumDebugFolder.add(this.floorMat.uniforms.uRingThickness, 'value')
                .min(0).max(0.005).step(0.0001).name('ringThickness');
            this.podiumDebugFolder.add(this.floorMat.uniforms.uCentreOpacity, 'value')
                .min(0).max(1).step(0.001).name('centreOpacity');
            // this.podiumDebugFolder.add(this.params, 'podiumPulseAmplitude')
            //     .min(0).max(0.01).step(0.0001).name('pulseAmplitude').onChange(() => {
            //         gsap.killTweensOf(this.floorMat.uniforms.uPodiumRadius);
            //         this.podiumPulseAnimation();
            //     });
            // this.podiumDebugFolder.add(this.params, 'podiumPulseFrequency')
            //     .min(0).max(5).step(0.1).name('pulseFrequency').onChange(() => {
            //         gsap.killTweensOf(this.floorMat.uniforms.uPodiumRadius);
            //         this.podiumPulseAnimation();
            //     });

            // Bools
            this.globalDebugFolder.add(this.params,'showOffset').onChange(() => {
                this.floorMat.uniforms.uOffsetBool.value = this.params.showOffset;
            })
            this.globalDebugFolder.add(this.params,'showUVs').onChange(() => {
                this.floorMat.uniforms.uUVsBool.value = this.params.showUVs;
            })
            this.globalDebugFolder.add(this.params,'showDots').onChange(() => {
                this.floorMat.uniforms.uDotsBool.value = this.params.showDots;
            })
            this.globalDebugFolder.add(this.params,'showGradient').onChange(() => {
                this.floorMat.uniforms.uGradientBool.value = this.params.showGradient;
            })
            this.globalDebugFolder.add(this.params,'showFresnel').onChange(() => {
                this.floorMat.uniforms.uFresnelBool.value = this.params.showFresnel;
            })
            this.globalDebugFolder.add(this.params,'showPodium').onChange(() => {
                this.floorMat.uniforms.uPodiumBool.value = this.params.showPodium;
            })
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
            // callbackScope: this,
            // onComplete: function() { this.podiumPulseAnimation() },
        });
    }

    // podiumPulseAnimation()
    // {
    //     gsap.to(this.floorMat.uniforms.uPodiumRadius, {
    //         value: this.params.podiumRadius + this.params.podiumPulseAmplitude,
    //         duration: this.params.podiumPulseFrequency,
    //         ease: 'sine.inOut',
    //         repeat: -1,
    //         repeatDelay: this.params.podiumPulseFrequency,
    //     });
    //     gsap.to(this.floorMat.uniforms.uPodiumRadius, {
    //         value: this.params.podiumRadius,
    //         duration: this.params.podiumPulseFrequency,
    //         delay: this.params.podiumPulseFrequency,
    //         ease: 'sine.inOut',
    //         repeat: -1,
    //         repeatDelay: this.params.podiumPulseFrequency,
    //     });
    // }

    setShadowPlane()
    {
        this.params.shadowOpacity = 0.05;
        
        const shadowPlaneGeo = new THREE.PlaneGeometry(2, 2, 1, 1);
        this.shadowPlaneMat = new THREE.ShadowMaterial({
            color: '#000000',
            opacity: this.params.shadowOpacity,
            transparent: true,
        });
        const shadowPlaneMesh = new THREE.Mesh(shadowPlaneGeo, this.shadowPlaneMat);
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
                    this.shadowPlaneMat.opacity = this.params.shadowOpacity;
                });
        }
    }

    setCharacter()
    {
        this.params.showCharacter = true;
        
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
            this.globalDebugFolder.add(this.params,'showCharacter').onChange(() => {
                character.visible = this.params.showCharacter;
            })
        }
    }

    setWatermark()
    {
        this.params.showWatermark = true;
        this.params.custoScale = 0.35;
        this.params.custoAlpha = 0.1;
        this.params.custoOffset = 0;
        
        const texture = this.resources.items.customuseIcon;
        texture.encoding = THREE.sRGBEncoding;
        
        const custoGeo = new THREE.PlaneGeometry(0.5, 0.5, 1, 1);
        this.custoMat = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: custoVert,
            fragmentShader: custoFrag,
            uniforms:
            {
                uTexture: { value: texture },
                uScale: { value: this.params.custoScale },
                uOffset: { value: this.params.custoOffset },
                uAlpha: { value: this.params.custoAlpha },
                uDarkMode: { value: false },
            },
        });
        const custoMesh = new THREE.Mesh(custoGeo, this.custoMat);
        custoMesh.rotation.x = Math.PI * -0.5;
        custoMesh.position.y = -0.196;
        custoMesh.renderOrder = 5;

        this.scene.add(custoMesh);

        // Debug
        if(this.debug.active)
        {
            this.podiumDebugFolder.add(this.params, 'custoScale')
                .min(0).max(1).step(0.01).name('custoScale').onChange(() => {
                    this.custoMat.uniforms.uScale.value = this.params.custoScale;
                })
            this.podiumDebugFolder.add(this.params, 'custoOffset')
                .min(-1.25).max(1).step(0.01).name('custoOffset').onChange(() => {
                    this.custoMat.uniforms.uOffset.value = this.params.custoOffset;
                })
            this.podiumDebugFolder.add(this.params, 'custoAlpha')
                .min(0).max(1).step(0.01).name('custoAlpha').onChange(() => {
                    this.custoMat.uniforms.uAlpha.value = this.params.custoAlpha;
                })
            this.globalDebugFolder.add(this.params,'showWatermark').onChange(() => {
                custoMesh.visible = this.params.showWatermark;
            })
        };
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
        this.renderer.params.backgroundColorLight = '#e5e7eb';
        this.renderer.renderer.setClearColor(this.renderer.params.backgroundColorLight);
        this.floorMat.uniforms.uFloorColor.value.set(this.params.floorColorLight);
        this.floorMat.uniforms.uDotsColor.value.set(this.params.dotsColorLight);
        this.floorMat.uniforms.uPodiumColor.value.set(this.params.podiumColorLight);
        this.custoMat.uniforms.uDarkMode.value = false;
    }

    enterDarkMode()
    {
        this.renderer.renderer.setClearColor(this.renderer.params.backgroundColorDark);
        this.floorMat.uniforms.uFloorColor.value.set(this.params.floorColorDark);
        this.floorMat.uniforms.uDotsColor.value.set(this.params.dotsColorDark);
        this.floorMat.uniforms.uPodiumColor.value.set(this.params.podiumColorDark);
        this.custoMat.uniforms.uDarkMode.value = true;
    }

    resetParams()
    {
        // Floor
        this.floorMat.uniforms.uFloorColor.value.set('#fafafa');
        this.floorMat.uniforms.uDotsColor.value.set('#dddfe4');
        this.floorMat.uniforms.uPodiumColor.value.set('#ffffff');
        this.floorMat.uniforms.uPodiumRadius.value = 0.022;
        this.floorMat.uniforms.uRingThickness.value = 0.0008;
        this.floorMat.uniforms.uCentreOpacity.value = 0.6;
        this.floorMat.uniforms.uFloorRadius.value = 0.2;
        this.floorMat.uniforms.uFresnelPower.value = 20;
        this.floorMat.uniforms.uDotRadius.value = 0.08;
        this.floorMat.uniforms.uGridScale.value = 301;
        this.shadowPlaneMat.opacity = 0.05;
        // Watermark
        this.custoMat.uniforms.uScale.value = 0.35;
        this.custoMat.uniforms.uAlpha.value = 0.1;
        this.custoMat.uniforms.uOffset.value = 0;
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.0002);
    }
}