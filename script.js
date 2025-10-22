const form = document.getElementById("formChamado");
const listaChamados = document.getElementById("listaChamados");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnCSV = document.getElementById("btnCSV");
const btnPDF = document.getElementById("btnPDF");

const modal = document.getElementById("modalDetalhes");
const detalhesDiv = document.getElementById("detalhesChamado");
const fecharModal = document.getElementById("fecharModal");

let chamados = JSON.parse(localStorage.getItem("chamados")) || [];

// Atualiza contadores da sidebar
function atualizarContadores() {
  const total = chamados.length;
  const pend = chamados.filter((c) => c.status === "P").length;
  const res = chamados.filter((c) => c.status === "R").length;
  const enc = chamados.filter((c) => c.status === "C").length;
  document.getElementById("totalChamados").textContent = total;
  document.getElementById("pendentes").textContent = pend;
  document.getElementById("resolvidos").textContent = res;
  document.getElementById("encaminhados").textContent = enc;
}

// Salvar ou editar chamado
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const index = document.getElementById("editarIndex").value;
  const now = new Date();
  const dataHora =
    index === ""
      ? now.toISOString().slice(0, 16).replace("T", " ")
      : chamados[index].dataHora;

  const chamado = {
    dataHora: dataHora,
    setor: document.getElementById("setor").value,
    profissional: document.getElementById("profissional").value,
    responsavel: document.getElementById("responsavel").value,
    problema: document.getElementById("problema").value,
    solucao: document.getElementById("solucao").value,
    status: document.getElementById("status").value,
  };

  if (index === "") chamados.push(chamado);
  else chamados[index] = chamado;

  localStorage.setItem("chamados", JSON.stringify(chamados));
  form.reset();
  document.getElementById("editarIndex").value = "";
  mostrarChamados(chamados);
  atualizarContadores();
});

// Mostrar chamados
function mostrarChamados(chamados) {
  listaChamados.innerHTML = "";
  if (window.innerWidth > 768) {
    const table = document.createElement("table");
    table.innerHTML = `<thead>
      <tr><th>Data/Hora</th><th>Setor</th><th>Profissional</th>
      <th>Responsável</th><th>Problema</th><th>Solução</th><th>Status</th><th>Ações</th></tr>
    </thead>`;
    const tbody = document.createElement("tbody");

    chamados.forEach((c, i) => {
      const statusClasse = `status-${c.status}`;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${c.dataHora}</td>
      <td>${c.setor}</td>
      <td>${c.profissional}</td>
      <td>${c.responsavel}</td>
      <td>${c.problema}</td>
      <td>${c.solucao}</td>
      <td><select class="status-chamado ${statusClasse}" data-index="${i}">
        <option value="P" ${c.status === "P" ? "selected" : ""}>P</option>
        <option value="R" ${c.status === "R" ? "selected" : ""}>R</option>
        <option value="C" ${c.status === "C" ? "selected" : ""}>C</option>
      </select></td>
      <td>
        <button class="btn-detalhes" data-index="${i}">Detalhes</button>
        <button class="btn-editar" data-index="${i}">Editar</button>
        <button class="btn-excluir" data-index="${i}">Excluir</button>
      </td>`;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    listaChamados.appendChild(table);
  } else {
    chamados.forEach((c, i) => {
      const statusClasse = `status-${c.status}`;
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `<p><strong>Data/Hora:</strong> ${c.dataHora}</p>
      <p><strong>Setor:</strong> ${c.setor}</p>
      <p><strong>Profissional:</strong> ${c.profissional}</p>
      <p><strong>Responsável:</strong> ${c.responsavel}</p>
      <p><strong>Problema:</strong> ${c.problema}</p>
      <label>Status:
        <select class="status-chamado ${statusClasse}" data-index="${i}">
          <option value="P" ${c.status === "P" ? "selected" : ""}>P</option>
          <option value="R" ${c.status === "R" ? "selected" : ""}>R</option>
          <option value="C" ${c.status === "C" ? "selected" : ""}>C</option>
        </select>
      </label>
      <button class="btn-detalhes" data-index="${i}">Detalhes</button>
      <button class="btn-editar" data-index="${i}">Editar</button>
      <button class="btn-excluir" data-index="${i}">Excluir</button>`;
      listaChamados.appendChild(card);
    });
  }

  // Eventos detalhes
  document.querySelectorAll(".btn-detalhes").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = btn.getAttribute("data-index");
      abrirModal(chamados[i]);
    });
  });

  // Eventos edição
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = btn.getAttribute("data-index");
      const c = chamados[i];
      document.getElementById("setor").value = c.setor;
      document.getElementById("profissional").value = c.profissional;
      document.getElementById("responsavel").value = c.responsavel;
      document.getElementById("problema").value = c.problema;
      document.getElementById("solucao").value = c.solucao;
      document.getElementById("status").value = c.status;
      document.getElementById("editarIndex").value = i;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Eventos exclusão
  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = btn.getAttribute("data-index");
      if (confirm("Deseja realmente excluir este chamado?")) {
        chamados.splice(i, 1);
        localStorage.setItem("chamados", JSON.stringify(chamados));
        mostrarChamados(chamados);
        atualizarContadores();
      }
    });
  });

  // Alterar status diretamente
  document.querySelectorAll(".status-chamado").forEach((select) => {
    select.addEventListener("change", () => {
      const idx = select.getAttribute("data-index");
      chamados[idx].status = select.value;
      localStorage.setItem("chamados", JSON.stringify(chamados));
      mostrarChamados(chamados);
      atualizarContadores();
    });
  });
}

// Modal
function abrirModal(c) {
  const statusNome =
    c.status === "P"
      ? "Pendente"
      : c.status === "R"
      ? "Resolvido"
      : "Encaminhado";
  detalhesDiv.innerHTML = `
    <p><strong>Data/Hora:</strong> ${c.dataHora}</p>
    <p><strong>Setor:</strong> ${c.setor}</p>
    <p><strong>Profissional:</strong> ${c.profissional}</p>
    <p><strong>Responsável:</strong> ${c.responsavel}</p>
    <p><strong>Problema:</strong><br>${c.problema}</p>
    <p><strong>Solução:</strong><br>${c.solucao || "-"}</p>
    <p><strong>Status:</strong> ${c.status} - ${statusNome}</p>
  `;
  modal.classList.add("show");
}

// Fechar modal
fecharModal.onclick = () => modal.classList.remove("show");
window.onclick = (e) => {
  if (e.target == modal) modal.classList.remove("show");
};

// Inicial
mostrarChamados(chamados);
atualizarContadores();

// Filtrar
btnFiltrar.addEventListener("click", () => {
  const inicio = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;
  let filtrados = [...chamados];
  if (inicio && fim) {
    const start = new Date(inicio + "T00:00");
    const end = new Date(fim + "T23:59");
    filtrados = filtrados.filter((c) => {
      const d = new Date(c.dataHora.replace(" ", "T"));
      return d >= start && d <= end;
    });
  }
  mostrarChamados(filtrados);
});

// Export CSV
btnCSV.addEventListener("click", () => {
  let csv =
    "Data/Hora,Setor,Profissional,Responsável,Problema,Solução,Status\n";
  chamados.forEach((c) => {
    csv += `"${c.dataHora}","${c.setor}","${c.profissional}","${c.responsavel}","${c.problema}","${c.solucao}","${c.status}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chamados.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// Export PDF
btnPDF.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  chamados.forEach((c, i) => {
    const statusNome =
      c.status === "P"
        ? "Pendente"
        : c.status === "R"
        ? "Resolvido"
        : "Encaminhado";
    doc.text(`Chamado ${i + 1}`, 10, y);
    y += 6;
    doc.text(`Data/Hora: ${c.dataHora}`, 10, y);
    y += 6;
    doc.text(`Setor: ${c.setor}`, 10, y);
    y += 6;
    doc.text(`Profissional: ${c.profissional}`, 10, y);
    y += 6;
    doc.text(`Responsável: ${c.responsavel}`, 10, y);
    y += 6;
    doc.text(`Problema: ${c.problema}`, 10, y);
    y += 6;
    doc.text(`Solução: ${c.solucao || "-"}`, 10, y);
    y += 6;
    doc.text(`Status: ${c.status} - ${statusNome}`, 10, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });
  doc.save("chamados.pdf");
});

// Atualiza ao redimensionar
window.addEventListener("resize", () => mostrarChamados(chamados));

// Alternar tema light/dark
const toggleThemeBtn = document.getElementById("toggleTheme");
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  toggleThemeBtn.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Modo Light"
    : "🌙 Modo Dark";
});
