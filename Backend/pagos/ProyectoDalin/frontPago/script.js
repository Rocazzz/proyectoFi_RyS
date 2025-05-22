function mostrarCampos() {
  document.getElementById("campo-tarjeta").classList.add("hidden");
  document.getElementById("campo-pse").classList.add("hidden");
  document.getElementById("campo-nequi").classList.add("hidden");

  const tipo = document.getElementById("tipo").value;
  if (tipo === "tarjeta") {
    document.getElementById("campo-tarjeta").classList.remove("hidden");
  } else if (tipo === "pse") {
    document.getElementById("campo-pse").classList.remove("hidden");
  } else if (tipo === "nequi") {
    document.getElementById("campo-nequi").classList.remove("hidden");
  }
}

document.getElementById("formularioPago").addEventListener("submit", async function(e) {
  e.preventDefault();

  const cliente_id = parseInt(document.getElementById("cliente_id").value);
  const tipo = document.getElementById("tipo").value;
  let detalle = {};

  if (tipo === "tarjeta") {
    detalle.numero = document.getElementById("numeroTarjeta").value;
    detalle.expiracion = document.getElementById("expiracionTarjeta").value;
  } else if (tipo === "pse") {
    detalle.correo = document.getElementById("correoPSE").value;
  } else if (tipo === "nequi") {
    detalle.numero = document.getElementById("numeroNequi").value;
  }

  const guardar = document.getElementById("guardarMetodo").checked;
  const body = { cliente_id, tipo, detalle, guardar };

  const res = await fetch("http://localhost:3301/pagos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await res.text();

  if (res.ok) {
    alert("✅ Pago exitoso.");
    document.getElementById("formularioPago").reset();
    mostrarCampos();
    
  } else {
      let ejemplo = "";

    if (tipo === "tarjeta") {
      ejemplo = `📌 Ejemplo correcto:
  {
      "cliente_id": ${cliente_id},
      "tipo": "tarjeta",
      "detalle": {
      "numero": "1234567812345678",
      "expiracion": "12/25"
    }
  }`;
    } else if (tipo === "pse") {
      ejemplo = `📌 Ejemplo correcto:
  {
      "cliente_id": ${cliente_id},
      "tipo": "pse",
      "detalle": {
      "correo": "ejemplo@correo.com"
    }
  }`;
    } else if (tipo === "nequi") {
      ejemplo = `📌 Ejemplo correcto:
  {
      "cliente_id": ${cliente_id},
      "tipo": "nequi",
      "detalle": {
      "numero": "3001234567"
    }
  }`;
    }

    alert(`❌ Error: ${text}\n\n${ejemplo}`);
  }


});

async function consultarMetodos() {
  const cliente_id = document.getElementById("consulta_cliente_id").value;
  const contenedor = document.getElementById("resultados");
  contenedor.innerHTML = "";

  const res = await fetch(`http://localhost:3301/pagos/${cliente_id}`);
  if (!res.ok) {
    alert("❌ Error al consultar los métodos de pago.");
    return;
  }

  const metodos = await res.json();
  if (metodos.length === 0) {
    contenedor.innerHTML = "<p>No hay métodos registrados.</p>";
    return;
  }

  const tabla = document.createElement("table");
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Detalle</th>
        <th>Acción</th>
      </tr>
    </thead>
    <tbody>
      ${metodos.map(m => `
        <tr>
          <td>${m.tipo}</td>
          <td>${JSON.stringify(m.detalle)}</td>
          <td><button onclick="eliminarMetodo(${m.id}, ${cliente_id})">Eliminar</button></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  tabla.style.width = "100%";
  tabla.style.borderCollapse = "collapse";
  contenedor.appendChild(tabla);
}


async function eliminarMetodo(metodo_id, cliente_id) {
  const res = await fetch(`http://localhost:3301/pagos/${metodo_id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente_id })
  });

  const mensaje = await res.text();
  alert(mensaje);
  consultarMetodos(); // Actualizar lista después de eliminar
}
