import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as THREE from 'three';

@Component({
  selector: 'app-background',
  standalone: true,
  template: `<canvas #earth id="earth"></canvas>`,
  styleUrls: ['./background.component.css']
})
export class BackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('earth') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private particles!: THREE.Group;
  private world!: THREE.Group;
  private bGeometry!: THREE.BufferGeometry;
  private animationId!: number;
  
  isAnimationActive: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAnimationActive = event.urlAfterRedirects.includes('login') || event.urlAfterRedirects.includes('register');
    });
  }

  ngAfterViewInit() {
    this.initThree();
    this.animate();
  }

  private initThree() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const R = 200;
    const fogC = '#722779'; // Daha siyah/mor derin arka plan

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(18, W / H, 1, 10000);
    this.camera.position.z = 1700;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(fogC, 1500, 2200);

    const loader = new THREE.TextureLoader();
    const T_earth = 'https://mapplix.github.io/earth/earth.png';
    const Emap = loader.load(T_earth);

    this.world = new THREE.Group();
    this.particles = new THREE.Group();

    // Icosahedron Net (Ağ yapısı)
    const geometry = new THREE.IcosahedronGeometry(R, 3);
    this.bGeometry =geometry;
    
    const material = new THREE.MeshStandardMaterial({
      color: '#420236',
      roughness: 0.5,
      metalness: 0.9,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
      flatShading:true,
    });

    const net = new THREE.Mesh(this.bGeometry, material);
    
    // İç Dünya Küresi
    const eMaterial = new THREE.MeshStandardMaterial({
      map: Emap,
      color: '#c5add1',
      emissive: '#211a29',
      metalness: 0.8
    });
    const earth = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.75, 3), eMaterial);

    this.particles.add(net, earth);
    this.world.add(this.particles);
    
    const hLight = new THREE.HemisphereLight('#9e7676ff', '#593d3dff', 2);
    this.world.add(hLight);
    
    this.scene.add(this.world);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.isAnimationActive) {
      this.particles.rotation.y += 0.002;
      this.particles.rotation.x += 0.000001;
      this.renderer.render(this.scene, this.camera);
    } else {
      // Harita ekranındayken render'ı durdurup kaynak tasarrufu yapabilirsin
      // Veya çok yavaş bir rotasyon bırakabilirsin
      this.renderer.clear();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}