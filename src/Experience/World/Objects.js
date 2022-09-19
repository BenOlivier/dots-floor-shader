import * as THREE from 'three'
import Experience from '../Experience.js'
import floorVert from '../Shaders/floorVert.glsl'
import floorFrag from '../Shaders/floorFrag.glsl'

export default class Object
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.time = this.experience.time

        this.setFloor()
        this.setCharacter()
    }

    setFloor()
    {
        const debugObject = {}
        debugObject.dotsColor = '#c8c8c8'
        
        const floorGeo = new THREE.PlaneGeometry(2.5, 2.5, 1, 1)
        const floorMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: floorVert,
            fragmentShader: floorFrag,
            uniforms:
            {
                uDotsColor: { value: new THREE.Color(debugObject.dotsColor) },
                uGridScale: { value: 50 },
                uDotRadius: { value: 0.1 },
                uAreaRadius: { value: 2 },
                uAreaPower: { value: 2 },
            }
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat)
        floorMesh.rotation.x = Math.PI * -0.5;
        floorMesh.position.y = -0.2;
        this.scene.add(floorMesh);

        // Debug
        if(this.debug.active)
        {
            this.debug.ui.addColor(debugObject, 'dotsColor').name('dotsColor').onChange(() =>
            {
                (floorMat.uniforms.uDotsColor.value.set(debugObject.dotsColor))
            })
            this.debug.ui.add(floorMat.uniforms.uGridScale, 'value')
                .min(1).max(100).step(1).name('gridScale')
            this.debug.ui.add(floorMat.uniforms.uDotRadius, 'value')
                .min(0).max(0.5).step(0.001).name('dotRadius')
            this.debug.ui.add(floorMat.uniforms.uAreaRadius, 'value')
                .min(0).max(10).step(0.01).name('areaRadius')
            this.debug.ui.add(floorMat.uniforms.uAreaPower, 'value')
                .min(0).max(10).step(0.01).name('areaPower')
        }

        const shadowPlaneGeo = new THREE.PlaneGeometry(2.5, 2.5, 1, 1)
        const shadowPlaneMat = new THREE.ShadowMaterial({
            color: '#444444',
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        const shadowPlaneMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat)
        shadowPlaneMesh.rotation.x = Math.PI * -0.5;
        shadowPlaneMesh.position.y = -0.199;
        shadowPlaneMesh.receiveShadow = true
        this.scene.add(shadowPlaneMesh);
    }

    setCharacter()
    {
        const characterResource = this.resources.items.characterModel;

        const character = characterResource.scene
        character.scale.set(0.2, 0.2, 0.2)
        character.position.y = -0.2
        character.rotation.y = Math.PI;
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
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}