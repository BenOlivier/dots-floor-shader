import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera

        this.setAmbientLight()
        this.setDirectionalLight()
    }

    setAmbientLight()
    {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 2)
        this.scene.add(this.ambientLight)
    }

    setDirectionalLight()
    {
        this.directionalLight = new THREE.PointLight('#ffffff', 20)
        this.directionalLight.position.set(0.25, 1, 0.5)
        this.directionalLight.rotation.x = Math.PI
        this.directionalLight.castShadow = true
        // this.directionalLight.shadow.camera.far = 500
        // this.directionalLight.shadow.camera.
        this.directionalLight.shadow.mapSize.set(1024, 1024)
        this.scene.add(this.directionalLight)
    }
}