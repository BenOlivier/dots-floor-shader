import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from 'gsap'
import overlayFrag from '../Shaders/overlayFrag.glsl'
import loadingBarFrag from '../Shaders/loadingBarFrag.glsl'

export default class Loading
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.time = this.experience.time
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.renderer = this.experience.renderer
        this.debug = this.experience.debug
        this.camera = this.experience.camera
        this.loadingText = document.querySelector('#text')
        this.debugObject = {}
        this.character = {}
        this.cap = {}

        // Events
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Parameters
        this.params = {
            loadingDuration: 2.5,
            previewFadeTime: 0.8,
            barLength: 0.5,
            barAnimationDuration: 1,
            barAnimationDelay: 0.5,
        }
        
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('loading')
            // this.debugFolder.close()

            const debugObject = {
                Load_Character: () => {
                    this.character.visible = true
                    this.cap.visible = false
                    this.camera.startPos = new THREE.Vector3(-0.5, 0, 2)
                    this.camera.endPos = new THREE.Vector3(0.25, 0.4, 1.2)
                    this.initiateLoadedSequence()
                },
                Load_Item: () => {
                    this.character.visible = false
                    this.cap.visible = true
                    this.camera.startPos = new THREE.Vector3(-0.1, 0, 1)
                    this.camera.endPos = new THREE.Vector3(0.1, 0.1, 0.5)
                    this.initiateLoadedSequence()
                }
            }
            this.debugFolder.add(debugObject, 'Load_Character')
            this.debugFolder.add(debugObject, 'Load_Item')
            this.debugFolder.add(this.params, 'loadingDuration')
                .min(0).max(10).step(0.1).name('loadingDuration')
            this.debugFolder.add(this.params, 'previewFadeTime')
                .min(0).max(5).step(0.1).name('previewFadeTime')
            this.debugFolder.add(this.params, 'barLength')
                .min(0).max(3).step(0.1).name('barLength')
            this.debugFolder.add(this.params, 'barAnimationDuration')
                .min(0).max(3).step(0.1).name('barAnimationDuration')
            this.debugFolder.add(this.params, 'barAnimationDelay')
                .min(0).max(3).step(0.1).name('barAnimationDelay')
        }
    }

    setOverlay()
    {
        this.resources = this.experience.resources
        this.overlayImage = this.resources.items.deadpoolBlur
        this.aspectRatio = this.sizes.width / this.sizes.height

        this.overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
        this.overlayMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms:
            {
                uAlpha: { value: 1 },
                uTexture: { value: this.overlayImage },
                uAspectRatio: { value: this.aspectRatio },
                uImageScale: { value: 0.5 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main()
                {
                    gl_Position = vec4(position, 1.0);
                    vUv = uv;
                }
            `,
            fragmentShader: overlayFrag
        })

        this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial)
        this.overlay.renderOrder = 0
        this.scene.add(this.overlay)
    }

    setLoadingBar()
    {
        this.loadingBarWidth = 500 / this.sizes.width
        this.loadingBarHeight = 8.5 / this.sizes.height

        this.debugObject.barColor = '#5797ff'
        this.debugObject.backgroundColor = '#5f5f5f'
        
        this.loadingBarGeometry = new THREE.PlaneGeometry(
            this.loadingBarWidth, this.loadingBarHeight, 1, 1)
        this.loadingBarMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms:
            {
                uBarColor: { value: new THREE.Color(this.debugObject.barColor) },
                uBackgroundColor: { value: new THREE.Color(this.debugObject.backgroundColor) },
                uFront: { value: 0.0 },
                uBack: { value: 0.0 },
                uAlpha: { value: 1.0 },
                uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) }
            },
            vertexShader: `
                varying vec2 vUv;

                void main()
                {
                    gl_Position = vec4(position, 1.0);
                    vUv = uv;
                }
            `,
            fragmentShader: loadingBarFrag
        })

        this.loadingBar = new THREE.Mesh(this.loadingBarGeometry, this.loadingBarMaterial)
        this.loadingBar.renderOrder = 999
        this.scene.add(this.loadingBar)

        if(this.debug.active)
        {
            this.debugFolder.addColor(this.debugObject, 'barColor').name('barColor').onChange(() =>
            {
                (this.loadingBarMaterial.uniforms.uBarColor.value.set(this.debugObject.barColor))
            })
            this.debugFolder.addColor(this.debugObject, 'backgroundColor').name('backgroundColor').onChange(() =>
            {
                (this.loadingBarMaterial.uniforms.uBackgroundColor.value.set(this.debugObject.backgroundColor))
            })
        }
    }

    LoadingBarAnimation()
    {
        gsap.killTweensOf(this.loadingBarMaterial.uniforms.uFront)
        gsap.killTweensOf(this.loadingBarMaterial.uniforms.uBack)
        gsap.killTweensOf(this.loadingBarMaterial.uniforms.uAlpha)
        gsap.killTweensOf(this.loadingText.style.opacity.value)
        this.loadingBarMaterial.uniforms.uFront.value = 0
        this.loadingBarMaterial.uniforms.uBack.value = 0
        this.loadingBarMaterial.uniforms.uAlpha.value = 1
        this.loadingText.style.opacity = 1

        // Loading bar animation
        gsap.to(this.loadingBarMaterial.uniforms.uFront, {
            value: 1,
            duration: this.params.barAnimationDuration,
            ease: 'power2.out',
            repeat: -1,
            repeatDelay: this.params.barAnimationDelay
        })
        gsap.to(this.loadingBarMaterial.uniforms.uBack, {
            value: 1,
            duration: this.params.barAnimationDuration,
            ease: 'power3.in',
            delay: 0,//this.params.barLength,
            repeat: -1,
            repeatDelay: this.params.barAnimationDelay
        })

        // Fade out loading bar
        gsap.to(this.loadingBarMaterial.uniforms.uAlpha, {
            value: 0,
            duration: 0.3,
            delay: this.params.loadingDuration,
            ease: 'linear',
        })
        // Fade out text
        gsap.to(this.loadingText.style, {
            opacity: 0,
            duration: 0.3,
            delay: this.params.loadingDuration,
            ease: 'linear'
        })
    }

    fadeOverlay()
    {
        gsap.killTweensOf(this.overlayMaterial.uniforms.uAlpha)
        this.overlayMaterial.uniforms.uAlpha.value = 1

        gsap.to(this.overlayMaterial.uniforms.uAlpha, {
            value: 0,
            duration: this.params.previewFadeTime,
            delay: this.params.loadingDuration,
            ease: 'linear',
            callbackScope: this,
            onStart: function () {
                this.camera.animateCamera()
            }
        })
    }

    initiateLoadedSequence()
    {
        this.LoadingBarAnimation()
        this.fadeOverlay()
    }

    resize()
    {
        this.loadingBarMaterial.uniforms.uResolution.value.x
            = this.sizes.width
        this.loadingBarMaterial.uniforms.uResolution.value.y
            = this.sizes.height

        this.aspectRatio = this.sizes.width / this.sizes.height
    }
}