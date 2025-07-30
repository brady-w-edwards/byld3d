//import { create_random_point } from "byld-kernel";
//import { createSignal } from "solid-js"
import { onMount } from "solid-js";

export default function ByldCanvas() {
    let canvasRef: HTMLCanvasElement | undefined;

    onMount(async() => {
        const canvas = canvasRef;
        if (!canvas) {
            throw new Error("No canvas element present.");
        };
        canvas.width = 512;
        canvas.height = 512;

        if (!navigator.gpu) {
            throw new Error("WebGPU not supported on this browser.");
        };

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        };

        const device = await adapter.requestDevice();

        const context = canvas.getContext("webgpu");
        if (!context) {
            throw new Error("No context found.");
        };
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: device,
            format: canvasFormat,
            alphaMode: 'premultiplied',
        });

        //let position = create_random_point(10);
        let pointData = new Float32Array([
            0,
            0,
            0,
        ]);

        const vertexBuffer = device.createBuffer({
            label: "Point",
            size: pointData.byteLength,        // 3 floats * 4 bytes each = 12 bytes
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(vertexBuffer, 0, pointData);

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 12,  // 12 bytes per vertex (3 floats × 4 bytes)
            attributes: [{
                format: "float32x3",    // 3 32-bit floats (x, y, z)
                offset: 0,              // starts at beginning of vertex data
                shaderLocation: 0,       // maps to @location(0) in your shader
            }],
        };

        const cellShaderModule = device.createShaderModule({
            label: "cell shader",
            code: `
                @vertex
                fn vertexMain(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
                    return vec4<f32>(position, 1.0);
                }
                
                @fragment
                fn fragmentMain() -> @location(0) vec4f {
                    return vec4f(1, 0, 0, 1);
                }
            `
        });

        const cellPipeline = device.createRenderPipeline({
            label: "Cell pipeline",
            layout: "auto",
            vertex: {
                module: cellShaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },
            fragment: {
                module: cellShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: canvasFormat
                }]
            },
            primitive: {
                topology: "point-list"
            }
        });

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                storeOp: "store",
            }]
        });

        pass.setPipeline(cellPipeline);
        pass.setVertexBuffer(0, vertexBuffer);
        pass.draw(1);
        pass.end();

        device.queue.submit([encoder.finish()]);
    });

    return (
        <>
            <canvas ref={canvasRef} width="512" height="512"/>
        </>
    );
};