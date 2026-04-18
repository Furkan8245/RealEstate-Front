import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as THREE from 'three';
import { Subscription } from 'rxjs';

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
  private animationId!: number;
  private routerSub!: Subscription; // Hafıza sızıntısını önlemek için

  isAnimationActive: boolean = true; // İlk açılışta aktif olsun

  constructor(private router: Router) {}

  ngOnInit() {
    // Router dinlemesini bir değişkene atıyoruz ki yok edebilelim
    this.routerSub = this.router.events.pipe(
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
    const fogC = '#1e1e2f'; // Daha optimize bir renk

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvasRef.nativeElement,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance" // GPU'ya öncelik ver
      });
      this.renderer.setSize(W, H);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performans için 2 ile sınırla
    } catch (e) {
      console.error("WebGL başlatılamadı:", e);
      return;
    }

    this.camera = new THREE.PerspectiveCamera(18, W / H, 1, 10000);
    this.camera.position.z = 1700;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(fogC, 1500, 2200);

    const loader = new THREE.TextureLoader();
    this.world = new THREE.Group();
    this.particles = new THREE.Group();

    // 1. Geometri ve Materyalleri değişkene alıyoruz ki DISPOSE edebilelim
    const netGeo = new THREE.IcosahedronGeometry(R, 3);
    const netMat = new THREE.MeshStandardMaterial({
      color: '#420236',
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const net = new THREE.Mesh(netGeo, netMat);

    const earthGeo = new THREE.IcosahedronGeometry(R * 0.75, 3);
    const earthMat = new THREE.MeshStandardMaterial({
      color: '#c5add1',
      emissive: '#211a29',
      metalness: 0.8
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);

    this.particles.add(net, earth);
    this.world.add(this.particles);
    
    const hLight = new THREE.HemisphereLight('#9e7676', '#593d3d', 2);
    this.world.add(hLight);
    this.scene.add(this.world);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.isAnimationActive && this.renderer) {
      this.particles.rotation.y += 0.002;
      this.renderer.render(this.scene, this.camera);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  ngOnDestroy() {
    // 1. Animasyonu durdur
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // 2. Router aboneliğini bitir
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }

    // 3. GPU Temizliği (ASIL KRİTİK NOKTA)
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss(); // Tarayıcıya "işim bitti" de
    }

    // 4. Sahnedeki tüm objeleri, geometrileri ve materyalleri temizle
    this.scene?.traverse((object: any) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: any) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}