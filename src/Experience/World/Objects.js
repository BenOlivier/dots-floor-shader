import * as THREE from 'three'
import Experience from '../Experience.js'
import floorVert from '../Shaders/floorVert.glsl'
import floorFrag from '../Shaders/floorFrag.glsl'
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

        this.debugObject = {}
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('environment')
            this.debugFolder.close()
        }

        this.setFloor()
        this.setShadowPlane()
        this.setBackground()
        this.setCharacter()
    }

    setFloor()
    {
        this.debugObject.dotsColor = '#c9c9c9'
        
        const floorGeo = new THREE.PlaneGeometry(10, 10, 1, 1)
        const floorMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.FrontSide,
            vertexShader: floorVert,
            fragmentShader: floorFrag,
            uniforms:
            {
                uDotsColor: { value: new THREE.Color(this.debugObject.dotsColor) },
                uGridScale: { value: 155 },
                uDotRadius: { value: 0.08 },
                uAreaRadius: { value: 2 },
                uAreaPower: { value: 0.5 },
            }
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat)
        floorMesh.rotation.x = Math.PI * -0.5;
        floorMesh.position.y = -0.2;
        this.scene.add(floorMesh);

        // Debug
        if(this.debug.active)
        {
            this.debugFolder.addColor(this.debugObject, 'dotsColor').name('dotsColor').onChange(() =>
            {
                (floorMat.uniforms.uDotsColor.value.set(this.debugObject.dotsColor))
            })
            this.debugFolder.add(floorMat.uniforms.uGridScale, 'value')
                .min(1).max(200).step(1).name('gridScale')
            this.debugFolder.add(floorMat.uniforms.uDotRadius, 'value')
                .min(0).max(0.5).step(0.001).name('dotRadius')
            this.debugFolder.add(floorMat.uniforms.uAreaRadius, 'value')
                .min(0).max(10).step(0.01).name('areaRadius')
            this.debugFolder.add(floorMat.uniforms.uAreaPower, 'value')
                .min(0).max(10).step(0.01).name('areaPower')
        }
    }

    setUnderFloor()
    {
        const underFloorGeo = new THREE.PlaneGeometry(10, 10, 1, 1)
        const underFloorMat = new THREE.MeshStandardMaterial({
            color: '#ff0000',
            transparent: true,
            opacity: 0.5
        })
        // underFloorMat.side = THREE.FrontSide()
        const underFloorMesh = new THREE.Mesh(underFloorGeo, underFloorMat)
        underFloorMesh.rotation.x = Math.PI * 0.5;
        underFloorMesh.position.y = -0.2;
        this.scene.add(underFloorMesh);
    }

    setShadowPlane()
    {
        const shadowPlaneGeo = new THREE.PlaneGeometry(2, 2, 1, 1)
        const shadowPlaneMat = new THREE.ShadowMaterial({
            color: '#000000',
            opacity: 0.5,
            // side: THREE.DoubleSide,
            transparent: true
        });
        const shadowPlaneMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat)
        shadowPlaneMesh.rotation.x = Math.PI * -0.5;
        shadowPlaneMesh.position.y = -0.199;
        shadowPlaneMesh.receiveShadow = true
        this.scene.add(shadowPlaneMesh)
    }

    setBackground()
    {
        this.debugObject.backgroundColor1 = '#f2f5f8'
        this.debugObject.backgroundColor2 = '#e7e4e7'
        const backgroundGeo = new THREE.SphereGeometry(20, 32, 32)
        const backgroundMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            vertexShader: backgroundVert,
            fragmentShader: backgroundFrag,
            uniforms:
            {
                uColor1: { value: new THREE.Color(this.debugObject.backgroundColor1) },
                uColor2: { value: new THREE.Color(this.debugObject.backgroundColor2) }
            }
        })
        const backgroundMesh = new THREE.Mesh(backgroundGeo, backgroundMat)
        this.scene.add(backgroundMesh)

        // Debug
        if(this.debug.active)
        {
            this.debugFolder.addColor(this.debugObject, 'backgroundColor1').name('backgroundColor1').onChange(() =>
            {
                (backgroundMat.uniforms.uColor1.value.set(this.debugObject.backgroundColor1))
            })
            this.debugFolder.addColor(this.debugObject, 'backgroundColor2').name('backgroundColor2').onChange(() =>
            {
                (backgroundMat.uniforms.uColor2.value.set(this.debugObject.backgroundColor2))
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

        character.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })

        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(character)

        this.animation.actions = {}
        this.animation.actions.main = this.animation.mixer.clipAction(characterResource.animations[0])
        
        this.animation.actions.main.play()
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.0002)
    }
}