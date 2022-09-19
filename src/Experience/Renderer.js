import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.debug = this.experience.debug

        this.setRenderer()
    }

    setRenderer()
    {
        const debugObject = {}
        debugObject.backgroundColor = '#f0f0f0'
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        })
        this.renderer.physicallyCorrectLights = true
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.toneMapping = THREE.NoToneMapping
        this.renderer.toneMappingExposure = 1.75
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setClearColor(debugObject.backgroundColor)
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        if(this.debug.active)
        {
            this.debug.ui.addColor(debugObject, 'backgroundColor')
            .name('backgroundColor').onChange(() =>
            {
                this.renderer.setClearColor(debugObject.backgroundColor)
            })
        }
    }

    resize()
    {
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    update()
    {
        this.renderer.render(this.scene, this.camera.camera)
    }
}