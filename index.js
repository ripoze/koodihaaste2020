let data = {
    "pysakit": [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R"
    ],
    "tiet": [
        {
            "mista": "A",
            "mihin": "B",
            "kesto": 3
        },
        {
            "mista": "B",
            "mihin": "D",
            "kesto": 2
        },
        {
            "mista": "D",
            "mihin": "A",
            "kesto": 1
        },
        {
            "mista": "A",
            "mihin": "C",
            "kesto": 1
        },
        {
            "mista": "C",
            "mihin": "D",
            "kesto": 5
        },
        {
            "mista": "C",
            "mihin": "E",
            "kesto": 2
        },
        {
            "mista": "E",
            "mihin": "D",
            "kesto": 3
        },
        {
            "mista": "E",
            "mihin": "F",
            "kesto": 1
        },
        {
            "mista": "F",
            "mihin": "G",
            "kesto": 1
        },
        {
            "mista": "G",
            "mihin": "H",
            "kesto": 2
        },
        {
            "mista": "H",
            "mihin": "I",
            "kesto": 2
        },
        {
            "mista": "I",
            "mihin": "J",
            "kesto": 1
        },
        {
            "mista": "I",
            "mihin": "G",
            "kesto": 1
        },
        {
            "mista": "G",
            "mihin": "K",
            "kesto": 8
        },
        {
            "mista": "K",
            "mihin": "L",
            "kesto": 1
        },
        {
            "mista": "L",
            "mihin": "M",
            "kesto": 1
        },
        {
            "mista": "E",
            "mihin": "M",
            "kesto": 10
        },
        {
            "mista": "M",
            "mihin": "N",
            "kesto": 2
        },
        {
            "mista": "N",
            "mihin": "O",
            "kesto": 2
        },
        {
            "mista": "O",
            "mihin": "P",
            "kesto": 2
        },
        {
            "mista": "O",
            "mihin": "Q",
            "kesto": 1
        },
        {
            "mista": "P",
            "mihin": "Q",
            "kesto": 2
        },
        {
            "mista": "N",
            "mihin": "Q",
            "kesto": 1
        },
        {
            "mista": "Q",
            "mihin": "R",
            "kesto": 5
        },
        {
            "mista": "R",
            "mihin": "N",
            "kesto": 3
        },
        {
            "mista": "D",
            "mihin": "R",
            "kesto": 6
        }
    ],
    "linjastot": {
        "keltainen": ["E", "F", "G", "K", "L", "M", "N"],
        "punainen": ["C", "D", "R", "Q", "N", "O", "P"],
        "vihreä": ["D", "B", "A", "C", "E", "F", "G", "H", "I", "J"],
        "sininen": ["D", "E", "M", "N", "O"]
    }
}

init();





function init() {
    //Luodaan data missä pysäkkivälit, linjat ja kestot
    data.linjat = []
    for (const [nimi, pysakit] of Object.entries(data.linjastot)) {
        for (let i = 0; i < pysakit.length - 1; i++) {
            const kesto = data.tiet.filter(tie =>
                (tie.mista == pysakit[i] && tie.mihin == pysakit[i + 1]) ||
                (tie.mista == pysakit[i + 1] && tie.mihin == pysakit[i])
            )[0].kesto
            data.linjat.push({ mista: pysakit[i], mihin: pysakit[i + 1], kesto: kesto, linja: nimi })
            data.linjat.push({ mista: pysakit[i + 1], mihin: pysakit[i], kesto: kesto, linja: nimi })
        }
    }
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
    let result = []
    const route = bellmanFord(data.pysakit, data.linjat, mista, mihin);
    for (let i = 0; i < route.length - 1; i++) {
        let linja = []
        if (i > 0) {
            //Ollaan vaihtamatta linjaa jos samalla voi jatkaa nopeimmalla reitillä
            linja = data.linjat.filter(tie => tie.mista == route[i] && tie.mihin == route[i + 1] && tie.linja == result[result.length - 1].linja)
        }
        if (linja.length == 0) linja = data.linjat.filter(tie => tie.mista == route[i] && tie.mihin == route[i + 1])
        result.push({ linja: linja[0].linja, mista: linja[0].mista, mihin: linja[0].mihin, kesto: linja[0].kesto })
    }
    result = yhdista(result)
    return result
}

function getStops() {
    return data.pysakit
}

function yhdista(data) {
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

