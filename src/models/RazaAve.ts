// src/models/RazaAve.ts

export class RazaAve {
  id: number;
  codigo: string;
  descripcion: string;

  constructor(id: number, codigo: string, descripcion: string) {
    this.id = id;
    this.codigo = codigo;
    this.descripcion = descripcion;
  }
}
