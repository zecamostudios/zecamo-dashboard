import { NextRequest, NextResponse } from "next/server";
import {
  getBrandMemory,
  createBrandMemory,
  updateBrandMemory,
  deleteBrandMemory,
  toggleBrandMemory,
} from "@/lib/db/content/brand-memory";

export async function GET() {
  const data = await getBrandMemory();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoria, clave, valor, activo = true, orden = 0 } = body;

    if (!categoria || !clave || !valor) {
      return NextResponse.json({ error: "categoria, clave y valor son requeridos" }, { status: 400 });
    }

    const item = await createBrandMemory({ categoria, clave, valor, activo, orden });
    if (!item) return NextResponse.json({ error: "Error al crear" }, { status: 500 });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    if ("activo" in updates && Object.keys(updates).length === 1) {
      await toggleBrandMemory(id, updates.activo as boolean);
    } else {
      await updateBrandMemory(id, updates);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    await deleteBrandMemory(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
