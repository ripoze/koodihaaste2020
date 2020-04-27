init();

let data;

async function init() {
    data = await fetch('reittiopas.json');
    data = await data.json();
    //Luodaan data missä pysäkkivälit, linjat ja kestot
    data.linjat = []
    for (const [nimi, pysakit] of Object.entries(data.linjastot)) {
        for (let i = 0; i < pysakit.length - 1; i++) {
            const kesto = data.tiet.filter(tie =>
                (tie.mista == pysakit[i] && tie.mihin == pysakit[i + 1]) ||
                (tie.mista == pysakit[i + 1] && tie.mihin == pysakit[i])
            )[0].kesto
            //Lisätään mistä->mihin kumpaankin suuntaan
            data.linjat.push({ mista: pysakit[i], mihin: pysakit[i + 1], kesto: kesto, linja: nimi })
            data.linjat.push({ mista: pysakit[i + 1], mihin: pysakit[i], kesto: kesto, linja: nimi })
        }
    }
    fillSelectBoxes()
}

function bellmanFord(pysakit, tiet, mista, mihin) {
    let distance = {};
    let predecessor = {};

    pysakit.map(v => {
        distance[v] = Infinity;
        predecessor[v] = null;
    });

    distance[mista] = 0;

    for (let i = 1; i < pysakit.length; i++) {
        for (let { mista, mihin, kesto } of tiet) {
            if (distance[mista] + kesto < distance[mihin]) {
                distance[mihin] = distance[mista] + kesto;
                predecessor[mihin] = mista;
            }
        }
    }

    let pysakki = [mihin];
    let reitti = [mihin];
    while (pysakki[0] != mista) {
        pysakki = predecessor[pysakki];
        reitti.push(pysakki);
    }
    reitti.reverse();
    return reitti;
}


function getRoute(mista, mihin) {
    console.log(mista, mihin);
    let result = []
    const route = bellmanFord(data.pysakit, data.linjat, mista, mihin);
    console.log(route);
    for (let i = 0; i < route.length - 1; i++) {
        let linja = []
        if (i > 0) {
            //Ollaan vaihtamatta linjaa jos samalla voi jatkaa nopeimmalla reitillä
            linja = data.linjat.filter(tie => tie.mista == route[i] && tie.mihin == route[i + 1] && tie.linja == result[result.length - 1].linja)
        }
        if (linja.length == 0) linja = data.linjat.filter(tie => tie.mista == route[i] && tie.mihin == route[i + 1])
        result.push({ linja: linja[0].linja, mista: linja[0].mista, mihin: linja[0].mihin, kesto: linja[0].kesto })
    }
    result = yhdista(result);
    return result
}


function yhdista(data) {
    //Yhdistää peräkkäiset samalla linjalla tapahtuvat pysäkkivälit ja summaa kestot
    let result = [];
    while (data[0]) {
        if (data[1] && data[0].linja == data[1].linja) {
            data[0].mihin = data[1].mihin;
            data[0].kesto = data[0].kesto + data[1].kesto
            data.splice(1, 1)
        } else {
            result.push(data[0])
            data.splice(0, 1)
        }
    }
    return result
}

function fillSelectBoxes() {
    //Täytetään selectit datan pysäkeillä
    let selectBox = document.getElementById('mihin');
    data.pysakit.forEach(stop => {
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode(stop));
        opt.value = stop;
        selectBox.appendChild(opt);
    })

    selectBox = document.getElementById('mista');
    data.pysakit.forEach(stop => {
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode(stop));
        opt.value = stop;
        selectBox.appendChild(opt);
    })
}


function updateRoute() {
    //Piirtää reittitaulukon käyttöliittymään
    const mista = document.getElementById('mista').value;
    const mihin = document.getElementById('mihin').value;
    const reitti = getRoute(mista, mihin);

    const table = document.getElementById("reittiTable");
    table.innerHTML = "";

    //Luodaan header uusiksi
    let header = table.createTHead();
    let row = header.insertRow();
    let cell = row.insertCell();
    cell.innerHTML = "<b>Linja</b>";
    cell = row.insertCell();
    cell.innerHTML = "<b>Mistä</b>";
    cell = row.insertCell();
    cell.innerHTML = "<b>Mihin</b>";
    cell = row.insertCell();
    cell.innerHTML = "<b>Kesto</b>";

    reitti.forEach(item => {
        let row = table.insertRow();
        let newCell = row.insertCell();
        newCell.innerHTML = item.linja;

        newCell = row.insertCell();
        newCell.innerHTML = item.mista;
        newCell = row.insertCell();
        newCell.innerHTML = item.mihin;
        newCell = row.insertCell();
        newCell.innerHTML = item.kesto;
    })
    row = table.insertRow();
    cell = row.insertCell();
    cell = row.insertCell();
    cell = row.insertCell();
    cell = row.insertCell();
    cell.innerHTML = `<b>${reitti.reduce((sum, item) => sum + item.kesto, 0)}</b>`;
}