interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

class StatsPanel {
  private min = Infinity;
  private max = 0;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly name: string;
  private readonly fg: string;
  private readonly bg: string;

  constructor(name: string, fg: string, bg: string) {
    this.name = name;
    this.fg = fg;
    this.bg = bg;
    this.canvas = document.createElement("canvas");
    const PR = Math.round(window.devicePixelRatio || 1);

    this.canvas.width = 80 * PR;
    this.canvas.height = 48 * PR;
    this.canvas.style.cssText = "width:80px;height:48px";

    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2D context");
    this.context = context;

    this.context.font = `bold ${9 * PR}px Helvetica,Arial,sans-serif`;
    this.context.textBaseline = "top";

    this.context.fillStyle = bg;
    this.context.fillRect(0, 0, 80 * PR, 48 * PR);

    this.context.fillStyle = fg;
    this.context.fillText(name, 3 * PR, 2 * PR);
    this.context.fillRect(3 * PR, 15 * PR, 74 * PR, 30 * PR);

    this.context.fillStyle = bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(3 * PR, 15 * PR, 74 * PR, 30 * PR);
  }

  update(value: number, maxValue: number): void {
    const PR = Math.round(window.devicePixelRatio || 1);
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, 80 * PR, 15 * PR);
    this.context.fillStyle = this.fg;
    this.context.fillText(
      `${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(
        this.max
      )})`,
      3 * PR,
      2 * PR
    );

    this.context.drawImage(
      this.canvas,
      3 * PR + PR,
      15 * PR,
      74 * PR - PR,
      30 * PR,
      3 * PR,
      15 * PR,
      74 * PR - PR,
      30 * PR
    );

    this.context.fillRect(3 * PR + 74 * PR - PR, 15 * PR, PR, 30 * PR);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(
      3 * PR + 74 * PR - PR,
      15 * PR,
      PR,
      Math.round((1 - value / maxValue) * 30 * PR)
    );
  }

  get domElement(): HTMLCanvasElement {
    return this.canvas;
  }
}

export class Stats {
  private mode = 0;
  private container: HTMLDivElement;
  private beginTime: number;
  private prevTime: number;
  private frames = 0;
  private fpsPanel: StatsPanel;
  private msPanel: StatsPanel;
  private memPanel?: StatsPanel;

  constructor() {
    this.container = document.createElement("div");
    this.container.style.cssText =
      "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
    this.container.addEventListener("click", (event) => {
      event.preventDefault();
      this.showPanel(++this.mode % this.container.children.length);
    });

    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;

    this.fpsPanel = new StatsPanel("FPS", "#0ff", "#002");
    this.msPanel = new StatsPanel("MS", "#0f0", "#020");
    this.container.appendChild(this.fpsPanel.domElement);
    this.container.appendChild(this.msPanel.domElement);

    if (self.performance && performance.memory) {
      this.memPanel = new StatsPanel("MB", "#f08", "#201");
      this.container.appendChild(this.memPanel.domElement);
    }

    this.showPanel(0);
  }

  showPanel(id: number): void {
    for (let i = 0; i < this.container.children.length; i++) {
      (this.container.children[i] as HTMLElement).style.display =
        i === id ? "block" : "none";
    }
    this.mode = id;
  }

  begin(): void {
    this.beginTime = (performance || Date).now();
  }

  end(): number {
    this.frames++;
    const time = (performance || Date).now();
    this.msPanel.update(time - this.beginTime, 200);

    if (time >= this.prevTime + 1000) {
      this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);
      this.prevTime = time;
      this.frames = 0;

      if (this.memPanel && performance.memory) {
        const memory = performance.memory;
        this.memPanel.update(
          memory.usedJSHeapSize / 1048576,
          memory.jsHeapSizeLimit / 1048576
        );
      }
    }

    return time;
  }

  update(): void {
    this.beginTime = this.end();
  }

  get dom(): HTMLDivElement {
    return this.container;
  }
}
