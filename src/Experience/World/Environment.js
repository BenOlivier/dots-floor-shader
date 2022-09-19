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
        this.directionalLight = new THREE.PointLight('#ffffff', 5)
        this.directionalLight.position.set(1, 4, 2)
        this.scene.add(this.directionalLight)
    }
}