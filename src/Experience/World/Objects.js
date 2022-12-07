import * as THREE from 'three'
import Experience from '../Experience.js'
import floorVert from '../Shaders/floorVert.glsl'
import floorFrag from '../Shaders/floorFrag.glsl'
import podiumVert from '../Shaders/podiumVert.glsl'
import podiumFrag from '../Shaders/podiumFrag.glsl'
import backgroundVert from '../Shaders/backgroundVert.glsl'
import backgroundFrag from '../Shaders/backgroundFrag.glsl'

export default class Object
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.loading = this.experience.loading

        this.debugObject = {}
        if(this.debug.active)
        {
            this.dotsDebugFolder = this.debug.ui.addFolder('dots')
            this.backgroundDebugFolder = this.debug.ui.addFolder('background')
            this.floorDebugFolder = this.debug.ui.addFolder('floor')
            this.podiumDebugFolder = this.debug.ui.addFolder('podium')
            this.dotsDebugFolder.close()
            this.backgroundDebugFolder.close()
            // this.floorDebugFolder.close()
            this.podiumDebugFolder.close()
        }

        this.params = {
            shadowOpacity: 0.1,
        }

        this.setBackground()
        this.setFloor()
        // this.setPodium()
        this.setShadowPlane()
        this.setCharacter()
        this.setCap()
    }

    setBackground()
    {
        this.debugObject.backgroundColor1 = '#dddfe4'
        this.debugObject.backgroundColor2 = '#dddfe4'
        const backgroundGeo = new THREE.SphereGeometry(20, 32, 32)
        const backgroundMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            vertexShader: backgroundVert,
            fragmentShader: backgroundFrag,
            uniforms:
            {
                uColor1: { value: new THREE.Color(this.debugObject.backgroundColor1) },
                uColor2: { value: new THREE.Color(this.debugObject.backgroundColor2) },
                uGradientRange: { value: 1 },
                uGradientOffset: { value: -0.3 },
            }
        })
        const backgroundMesh = new THREE.Mesh(backgroundGeo, backgroundMat)
        backgroundMesh.rotation.z = Math.PI * 0.5
        this.scene.add(backgroundMesh)

        // Debug
        if(this.debug.active)
        {
            this.backgroundDebugFolder.addColor(this.debugObject, 'backgroundColor1').name('backgroundColor1').onChange(() =>
            {
                (backgroundMat.uniforms.uColor1.value.set(this.debugObject.backgroundColor1))
            })
            this.backgroundDebugFolder.addColor(this.debugObject, 'backgroundColor2').name('backgroundColor2').onChange(() =>
            {
                (backgroundMat.uniforms.uColor2.value.set(this.debugObject.backgroundColor2))
            })
            this.backgroundDebugFolder.add(backgroundMat.uniforms.uGradientRange, 'value')
                .min(0).max(10).step(0.1).name('gradientRange')
            this.backgroundDebugFolder.add(backgroundMat.uniforms.uGradientOffset, 'value')
                .min(-10).max(10).step(0.1).name('gradientOffset')
        }
    }

    setFloor()
    {
        this.debugObject.floorColor = '#ffffff'
        this.debugObject.dotsColor = '#dbdbdb'
        
        const floorGeo = new THREE.PlaneGeometry(10, 10, 1, 1)
        const floorMat = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: floorVert,
            fragmentShader: floorFrag,
            uniforms:
            {
                uFloorColor: { value: new THREE.Color(this.debugObject.floorColor) },
                uFloorRadius: { value: 2 },
                uFloorPower: { value: 0.5 },
                uFresnelPower: { value: 50 },

                uDotsColor: { value: new THREE.Color(this.debugObject.dotsColor) },
                uGridScale: { value: 301 },
                uDotRadius: { value: 0.08 },
            }
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat)
        floorMesh.rotation.x = Math.PI * -0.5;
        floorMesh.position.y = -0.2;
        floorMesh.renderOrder = 1;
        this.scene.add(floorMesh);

        // Debug
        if(this.debug.active)
        {
            // Floor
            this.floorDebugFolder.addColor(this.debugObject, 'floorColor').name('floorColor').onChange(() =>
            {
                (floorMat.uniforms.uFloorColor.value.set(this.debugObject.floorColor))
            })
            this.floorDebugFolder.add(floorMat.uniforms.uFloorRadius, 'value')
                .min(0).max(10).step(0.01).name('floorRadius')
            this.floorDebugFolder.add(floorMat.uniforms.uFloorPower, 'value')
                .min(0).max(10).step(0.01).name('floorPower')
            this.floorDebugFolder.add(floorMat.uniforms.uFresnelPower, 'value')
                .min(0).max(100).step(0.01).name('fresnelPower')

            // Dots
            this.dotsDebugFolder.addColor(this.debugObject, 'dotsColor').name('dotsColor').onChange(() =>
            {
                (floorMat.uniforms.uDotsColor.value.set(this.debugObject.dotsColor))
            })
            this.dotsDebugFolder.add(floorMat.uniforms.uDotRadius, 'value')
                .min(0).max(0.5).step(0.001).name('dotRadius')
            this.dotsDebugFolder.add(floorMat.uniforms.uGridScale, 'value')
                .min(1).max(500).step(1).name('gridScale')
        }
    }

    setPodium()
    {
        this.debugObject.podiumRingColor = '#ffffff'
        this.debugObject.podiumCentreColor = '#ffffff'

        const podiumGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
        const podiumMat = new THREE.ShaderMaterial({
            transparent: true,
            // depthWrite: false,
            vertexShader: podiumVert,
            fragmentShader: podiumFrag,
            uniforms:
            {
                uRingColor: { value: new THREE.Color(this.debugObject.podiumRingColor) },
                uCentreColor: { value: new THREE.Color(this.debugObject.podiumCentreColor) },
                uRadius: { value: 0.22 },
                uRingThickness: { value: 0.01 },
                uCentreOpacity: { value: 0.5 },
            }
        });
        const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat)
        podiumMesh.rotation.x = Math.PI * -0.5;
        podiumMesh.position.y = -0.199;
        this.scene.add(podiumMesh);

        // Debug
        if(this.debug.active)
        {
            this.podiumDebugFolder.addColor(this.debugObject, 'podiumRingColor').name('podiumRingColor').onChange(() =>
            {
                (podiumMat.uniforms.uRingColor.value.set(this.debugObject.podiumRingColor))
            })
            this.podiumDebugFolder.addColor(this.debugObject, 'podiumCentreColor').name('podiumCentreColor').onChange(() =>
            {
                (podiumMat.uniforms.uCentreColor.value.set(this.debugObject.podiumCentreColor))
            })
            this.podiumDebugFolder.add(podiumMat.uniforms.uRadius, 'value')
                .min(0).max(1).step(0.001).name('podiumRadius')
                this.podiumDebugFolder.add(podiumMat.uniforms.uRingThickness, 'value')
                .min(0).max(0.2).step(0.001).name('ringThickness')
            this.podiumDebugFolder.add(podiumMat.uniforms.uCentreOpacity, 'value')
                .min(0).max(1).step(0.001).name('centreOpacity')
        }
    }

    setShadowPlane()
    {
        const shadowPlaneGeo = new THREE.PlaneGeometry(2, 2, 1, 1)
        const shadowPlaneMat = new THREE.ShadowMaterial({
            color: '#000000',
            opacity: this.params.shadowOpacity,
            transparent: true
        });
        const shadowPlaneMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat)
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
                    shadowPlaneMat.opacity = this.params.shadowOpacity
                    // console.log(this.shadowPlaneMat)
                })
        }
    }

    setCharacter()
    {
        const characterResource = this.resources.items.characterModel

        const character = characterResource.scene
        character.scale.set(0.2, 0.2, 0.2)
        character.position.y = -0.2
        character.rotation.y = Math.PI

        this.scene.add(character)
        this.loading.character = character
        // character.visible = false

        character.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.renderOrder = 2;
                child.castShadow = true
            }
        })

        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(character)

        this.animation.actions = {}
        this.animation.actions.main = this.animation.mixer.clipAction(characterResource.animations[0])
        
        this.animation.actions.main.play()
    }

    setCap()
    {
        const capResource = this.resources.items.capModel

        const cap = capResource.scene
        cap.scale.set(0.02, 0.02, 0.02)
        // cap.position.y = 0.1
        // cap.rotation.y = Math.PI
        cap.visible = false
        this.scene.add(cap)
        this.loading.cap = cap

        cap.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                // child.castShadow = true
            }
        })
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.0002)
    }
}