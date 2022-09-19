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
        this.debug = this.experience.debug

        this.setFloor()
    }

    setFloor()
    {
        const debugObject = {}
        debugObject.dotsColor = '#808080'
        
        const floorGeo = new THREE.PlaneGeometry(2.5, 2.5, 1, 1)
        const floorMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: floorVert,
            fragmentShader: floorFrag,
            uniforms:
            {
                // uSmallWavesIterations: { value: 4 },
                uDotsColor: { value: new THREE.Color(debugObject.dotsColor) },
                uGridScale: { value: 50 },
                uDotRadius: { value: 0.1 },
                uAreaRadius: { value: 2 },
                uAreaPower: { value: 2 },
            }
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat)
        floorMesh.rotation.x = Math.PI * -0.5
        this.scene.add(floorMesh)

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
    }
}