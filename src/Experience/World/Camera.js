import * as THREE from 'three'
import Experience from '../Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug
        this.loading = this.experience.loading

        this.startPos = new THREE.Vector3(-0.5, 0, 2)
        this.endPos = new THREE.Vector3(0.25, 0.4, 1.2)
        this.lookAtPos = new THREE.Vector3(0, 0, 0)

        this.setCamera()
        this.setControls()
    }

    setCamera()
    {
        this.camera = new THREE.PerspectiveCamera
            (35, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.set(this.startPos.x, this.startPos.y, this.startPos.z)
        this.scene.add(this.camera)
    }

    setControls()
    {
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true
        this.controls.minDistance = 0.2
        // this.controls.maxDistance = 2
        // this.controls.minPolarAngle = Math.PI * 0.1
        this.controls.maxPolarAngle = Math.PI * 0.8
    }

    animateCamera()
    {
        gsap.killTweensOf(this.camera.position)
        this.camera.position.set(this.startPos.x, this.startPos.y, this.startPos.z)
        gsap.to(this.camera.position, {
            x: this.endPos.x,
            y: this.endPos.y,
            z: this.endPos.z,
            duration: 2.5,
            ease: 'power3.out',
            callbackScope: this,
            onUpdate: function() {
                this.camera.lookAt(this.lookAtPos)
            },
            onComplete: function() {
                this.allowAnimate = true
            }
        })
    }

    resize()
    {
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()
    }

    update()
    {
        this.controls.update()
    }
}