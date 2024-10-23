let display;

$(function () {
    $('a').each(function () {
        if ($(this).prop('href') == window.location.href) {
            $(this).addClass('active');
            $(this).parents('li').addClass('active');
            console.log($(this).prop('href'));
        }
    });
});

let lastChar;
let jeZadnjiElOperand = false;

function clearDisplay() {
    display.value = '';
    jeZadnjiElOperand = false;
}

function appendNumber(number) {
    if (display) {
        display.value += number;
        jeZadnjiElOperand = false;
    }
}

function appendOperator(operator) {
    if (!jeZadnjiElOperand) {
        display.value += operator;
        jeZadnjiElOperand = true;
    } else {
        display.value = display.value.slice(0, -1) + operator;
    }
}

function appendDecimal() {
    const zadnjaRegex = /(\d*\.?\d+)$/; //regex najde zadnjo številko
    const zadnja = display.value.match(zadnjaRegex); //vrne array zadnje številke (ta funkcija je zato ka lejko dodaš več decimalk v računi, nej samo za eno številko (pač fsak faktor ma lejko decimalko))

    if (zadnja && !zadnja[0].includes('.')) { 
        display.value += '.';
        jeZadnjiElOperand = false;
    }
}

function calculate() {
    let enacba = display.value;

    if (enacba.includes('|') || enacba.includes('&') || enacba.includes('^') || enacba.includes('¬')) {
        let rezultat = evalLogicnaVrata(enacba);
        if (rezultat === "") {
            rezultat = "0";
        }
        console.log(rezultat);
        display.value = rezultat.toString();
        jeZadnjiElOperand = false;
    } else {
        try {
            let racun = display.value;
            racun = racun.replace(/√/g, 'Math.sqrt').replace(/²/g, '**2');
            display.value = eval(racun);
            jeZadnjiElOperand = false;
        } catch (error) {
            display.value = 'Error';
        }
    }
}

function evalLogicnaVrata(enacba) {
    let en = enacba.split(" ");
    let rezultat = "";

    while (en.includes("(")) {
        let iOklepaj = en.lastIndexOf("(");
        let iZaklepaj = en.indexOf(")", iOklepaj);

        if (iOklepaj !== -1 && iZaklepaj !== -1 && iOklepaj < iZaklepaj) {
            let temp = en.slice(iOklepaj + 1, iZaklepaj);
            let rez = evalLogicnaVrata(temp.join(" "));

            en.splice(iOklepaj, iZaklepaj - iOklepaj + 1, rez);
        } else {
            break;
        }
    }

    // NEGACIJA
    while (en.includes("¬")) {
        let index = en.indexOf("¬");
        let operand = en[index + 1];

        let negacija = operand.split('').map(bit => (bit === '0' ? '1' : '0'));

        rezultat = negacija.join('').toString();

        en.splice(index - 1, 3, rezultat);
    }

    // KONJUNKCIJA (AND)
    while (en.includes("&")) {
        let index = en.indexOf("&");
        let prvoSt = en[index - 1];
        let drugoSt = en[index + 1];

        rezultat = decToBin(
            eval(binToDec(prvoSt) & binToDec(drugoSt))
        ).toString();
        console.log(rezultat);
        en.splice(index - 1, 3, rezultat);
    }

    // DISJUNKCIJA (OR)
    while (en.includes("|")) {
        let index = en.indexOf("|");
        let prvoSt = en[index - 1];
        let drugoSt = en[index + 1];

        rezultat = decToBin(
            eval(binToDec(prvoSt) | binToDec(drugoSt))
        ).toString();

        en.splice(index - 1, 3, rezultat);
    }

    // XOR
    while (en.includes("^")) {
        let index = en.indexOf("^");
        let prvoSt = en[index - 1];
        let drugoSt = en[index + 1];

        rezultat = decToBin(
            eval(binToDec(prvoSt) ^ binToDec(drugoSt))
        ).toString();

        en.splice(index - 1, 3, rezultat);
    }

   // display.value = rezultat;
    return rezultat;
}


function appendOklepaj(oklepaj) {
    display.value += oklepaj;
    jeZadnjiElOperand = false;
}

function appendFunction(func) {
    display.value += func + '(';
    jeZadnjiElOperand = false;
}

function potenca() {
    if (!jeZadnjiElOperand) {
        display.value += '²';
        jeZadnjiElOperand = false;
    }
}

function CE() {
    let currentValue = display.value;
    if (currentValue === "Error" || currentValue === "undefined" || currentValue === "Infinity" || currentValue === "-Infinity") {
        display.value = "";
        jeZadnjiElOperand = true;
    } else {
        display.value = currentValue.substring(0, currentValue.length - 1);
    }
    jeZadnjiElOperand = false;
}

// function isLastCharOperator() {
//     return /[+\-*/%¬^|&]/.test(lastChar);
// }

function openFileUploader() {
    document.getElementById('fileInput').click();
}

function displayEquation(i) {
    var enacbaTxt = enacbe[i]?.trim();

    if (enacbaTxt !== undefined && enacbaTxt !== "") {
        enacbaTxt = enacbaTxt.replace(/x/g, "*");
        enacbaTxt = enacbaTxt.replace(/pow/g, "Math.pow");
        enacbaTxt = enacbaTxt.replace(/sqrt/g, "Math.sqrt");
        enacbaTxt = enacbaTxt.replace(/=/g, "");

        var rezultat = eval(enacbaTxt);
        var zaokrozeno = rezultat.toFixed(2);
        display.value = enacbaTxt + " = " + zaokrozeno + "\n";

        var enakost = document.getElementById('enakost');
        if (enakost) {
            enakost.onclick = function () {
                i++;
                if (i < enacbe.length) {
                    displayEquation(i);
                } else {
                    display.value = "";
                    fileInput.value = "";
                }
            };
        }
    }
}


function uploadFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        display = document.getElementById('display');
        var enacbe = [];

        reader.onload = function (e) {
            enacbe = e.target.result.split("\n");

            displayEquation(0);
        };

        reader.onerror = function (error) {
            console.error("Error reading the file:", error);
        };

        try {
            reader.readAsText(file);
        } catch (error) {
            console.error("Error reading the file:", error);
        }

        function displayEquation(i) {
            var enacbaTxt = enacbe[i]?.trim();

            if (enacbaTxt !== undefined && enacbaTxt !== "") {
                enacbaTxt = enacbaTxt.replace(/x/g, "*");
                enacbaTxt = enacbaTxt.replace(/pow/g, "Math.pow");
                enacbaTxt = enacbaTxt.replace(/sqrt/g, "Math.sqrt");
                enacbaTxt = enacbaTxt.replace(/=/g, "");

                var rezultat = eval(enacbaTxt);
                var zaokrozeno = rezultat.toFixed(2);
                display.value = enacbaTxt + " = " + zaokrozeno + "\n";

                var enakost = document.getElementById('enakost');
                if (enakost) {
                    enakost.onclick = function () {
                        i++;
                        if (i < enacbe.length) {
                            displayEquation(i);
                        } else {
                            display.value = "";
                            fileInput.value = "";
                        }
                    };
                }
            }
        }
    }
}



document.addEventListener('DOMContentLoaded', function () {
    display = document.getElementById('display');

    if (display) {
        display.addEventListener('input', function () {
            lastChar = display.value.slice(-1);
        });

        var and = document.getElementById("and");
        var or = document.getElementById("or");
        var xor = document.getElementById("xor");
        var neg = document.getElementById("neg");

        if (and) {
            and.addEventListener("click", function () {
                display.value += " & ";
            });
        }

        if (or) {
            or.addEventListener("click", function () {
                display.value += " | ";
            });
        }

        if (xor) {
            xor.addEventListener("click", function () {
                display.value += " ^ ";
            });
        }

        if (neg) {
            neg.addEventListener("click", function () {
                display.value += " ¬ ";
            });
        }

        activeDec();
    } else {
        console.error("Display element not found.");
    }
});





// VSE PRETVORBE:

function decToBin(stevilo) {
    if (!/^\d+$/.test(stevilo) || stevilo < 0) {
        throw new Error("Število ne sme biti predznačeno (negativno).");
    }

    if (stevilo === "0") {
        return "0";
    }

    let binarno = "";
    let num = parseInt(stevilo);
    while (num > 0) {
        let ostanek = num % 2;
        binarno = ostanek + binarno;
        num = Math.floor(num / 2);
    }

    return binarno;
}

function binToDec(stevilo) {
    let decimal = 0;
    for (let i = stevilo.length - 1, j = 0; i >= 0; i--, j++) {
        decimal += parseInt(stevilo[i]) * Math.pow(2, j);
    }

    return decimal;
}

function hexToBin(hex) {
    let binary = "";
    for (let i = 0; i < hex.length; i++) {
        const value = parseInt(hex[i], 16);
        binary += ("0000" + value.toString(2)).slice(-4);
    }
    return binary;
}

function binToHex(bin) {
    let hex = "";
    for (let i = 0; i < bin.length; i += 4) {
        const chunk = bin.slice(i, i + 4);
        const value = parseInt(chunk, 2);
        hex += value.toString(16);
    }
    return hex.toUpperCase();
}

function hexToDec(hex) {
    let decimal = 0;
    for (let i = hex.length - 1, j = 0; i >= 0; i--, j++) {
        const value = parseInt(hex[i], 16);
        decimal += value * Math.pow(16, j);
    }
    return decimal;
}

function decToHex(dec) {
    let hex = "";
    let num = parseInt(dec);
    while (num > 0) {
        const remainder = num % 16;
        hex = remainder.toString(16) + hex;
        num = Math.floor(num / 16);
    }
    return hex === "" ? "0" : hex.toUpperCase();
}

function hexToOct(hex) {
    const decimal = parseInt(hex, 16);
    return decimal.toString(8);
}

function octToHex(oct) {
    const decimal = parseInt(oct, 8);
    return decimal.toString(16).toUpperCase();
}


function decToOct(dec) {
    let octal = "";
    let num = parseInt(dec);
    while (num > 0) {
        const remainder = num % 8;
        octal = remainder.toString(8) + octal;
        num = Math.floor(num / 8);
    }
    return octal === "" ? "0" : octal;
}

function octToDec(oct) {
    let decimal = 0;
    for (let i = oct.length - 1, j = 0; i >= 0; i--, j++) {
        decimal += parseInt(oct[i]) * Math.pow(8, j);
    }
    return decimal;
}

function octToBin(oct) {
    let binary = "";
    for (let i = 0; i < oct.length; i++) {
        const value = parseInt(oct[i], 8);
        binary += ("000" + value.toString(2)).slice(-3);
    }
    return binary;
}

function binToOct(bin) {
    let octal = "";
    for (let i = 0; i < bin.length; i += 3) {
        const chunk = bin.slice(i, i + 3);
        const value = parseInt(chunk, 2);
        octal += value.toString(8);
    }
    return octal;
}




// IZBIRANJE ŠTEVILSKIH SITEMOV:

function activeHex() {
    var button = document.getElementById("hex");

    let keypad = $(".keypad");
    keypad.removeClass("prepoved");

    console.log("test");
    button.classList.add("active");
    document.getElementById("dec").classList.remove("active");
    document.getElementById("oct").classList.remove("active");
    document.getElementById("bin").classList.remove("active");
}



function activeDec() {
    var button = document.getElementById("dec");

    let keypad = $(".keypad");
    keypad.removeClass("prepoved");

    if (button) {
        console.log("test");
        button.classList.add("active");
        document.getElementById("hex").classList.remove("active");
        document.getElementById("oct").classList.remove("active");
        document.getElementById("bin").classList.remove("active");

        $(".keypad:not(.dec)").addClass("prepoved");
    }
}



function activeOct() {
    var button = document.getElementById("oct");

    let keypad = $(".keypad");
    keypad.removeClass("prepoved");

    if (button) {
        console.log("test");
        button.classList.add("active");
        document.getElementById("hex").classList.remove("active");
        document.getElementById("dec").classList.remove("active");
        document.getElementById("bin").classList.remove("active");

        $(".keypad:not(.oct)").addClass("prepoved");
    }
}


function activeBin() {
    var button = document.getElementById("bin");

    let keypad = $(".keypad");
    keypad.removeClass("prepoved");

    if (button) {
        console.log("test");
        button.classList.add("active");
        document.getElementById("hex").classList.remove("active");
        document.getElementById("oct").classList.remove("active");
        document.getElementById("dec").classList.remove("active");

        $(".keypad:not(.bin)").addClass("prepoved");
    }
}

function currentlyActive() {
    if (document.getElementById("hex").classList.contains("active")) {
        return "hex";
    } else if (document.getElementById("dec").classList.contains("active")) {
        return "dec";
    } else if (document.getElementById("oct").classList.contains("active")) {
        return "oct";
    } else if (document.getElementById("bin").classList.contains("active")) {
        return "bin";
    }
}

function convert(stevilo, sistem) {
    let input = document.getElementById("display").value;
    let outputHex = document.getElementById("hexDisplay");
    let outputDec = document.getElementById("decDisplay");
    let outputOct = document.getElementById("octDisplay");
    let outputBin = document.getElementById("binDisplay");
    let activeSystem = currentlyActive();

    if (activeSystem === "hex") {
        if (/^[0-9A-Fa-f]+$/.test(input)) {
            outputDec.innerHTML = hexToDec(input);
            outputOct.innerHTML = hexToOct(input);
            outputBin.innerHTML = hexToBin(input);
            outputHex.innerHTML = input;
        } else {
            outputHex.innerHTML = "Napaka";
        }
    } else if (activeSystem === "dec") {
        if (/^[0-9]+$/.test(input)) {
            outputHex.innerHTML = decToHex(input);
            outputOct.innerHTML = decToOct(input);
            outputBin.innerHTML = decToBin(input);
            outputDec.innerHTML = input;
        } else {
            outputDec.innerHTML = "Napaka";
        }
    } else if (activeSystem === "oct") {
        if (/^[0-7]+$/.test(input)) {
            outputHex.innerHTML = octToHex(input);
            outputDec.innerHTML = octToDec(input);
            outputBin.innerHTML = octToBin(input);
            outputOct.innerHTML = input;
        } else {
            outputOct.innerHTML = "Napaka";
        }
    } else if (activeSystem === "bin") {
        if (/^[01]+$/.test(input)) {
            outputHex.innerHTML = binToHex(input);
            outputDec.innerHTML = binToDec(input);
            outputOct.innerHTML = binToOct(input);
            outputBin.innerHTML = input;
        } else {
            outputBin.innerHTML = "Napaka";
        }
    }
}

function convert(stevilo, sistem) {
    let input = document.getElementById("display").value;
    let outputHex = document.getElementById("hexDisplay");
    let outputDec = document.getElementById("decDisplay");
    let outputOct = document.getElementById("octDisplay");
    let outputBin = document.getElementById("binDisplay");
    let activeSystem = currentlyActive();

    if (activeSystem === "hex") {
        if (/^[0-9A-Fa-f]+$/.test(input)) {
            outputDec.innerHTML = hexToDec(input);
            outputOct.innerHTML = hexToOct(input);
            outputBin.innerHTML = hexToBin(input);
            outputHex.innerHTML = input;
        } else {
            outputHex.innerHTML = "Napaka";
        }
    } else if (activeSystem === "dec") {
        if (/^[0-9]+$/.test(input)) {
            outputHex.innerHTML = decToHex(input);
            outputOct.innerHTML = decToOct(input);
            outputBin.innerHTML = decToBin(input);
            outputDec.innerHTML = input;
        } else {
            outputDec.innerHTML = "Napaka";
        }
    } else if (activeSystem === "oct") {
        if (/^[0-7]+$/.test(input)) {
            outputHex.innerHTML = octToHex(input);
            outputDec.innerHTML = octToDec(input);
            outputBin.innerHTML = octToBin(input);
            outputOct.innerHTML = input;
        } else {
            outputOct.innerHTML = "Napaka";
        }
    } else if (activeSystem === "bin") {
        if (/^[01]+$/.test(input)) {
            outputHex.innerHTML = binToHex(input);
            outputDec.innerHTML = binToDec(input);
            outputOct.innerHTML = binToOct(input);
            outputBin.innerHTML = input;
        } else {
            outputBin.innerHTML = "Napaka";
        }
    }
}

function clearConversions() {
    let outputHex = document.getElementById("hexDisplay");
    let outputDec = document.getElementById("decDisplay");
    let outputOct = document.getElementById("octDisplay");
    let outputBin = document.getElementById("binDisplay");
    outputBin.innerHTML = "0";
    outputOct.innerHTML = "0";
    outputDec.innerHTML = "0";
    outputHex.innerHTML = "0";
}

/*
function formatirajFile(file) {
    var reader = new FileReader();

    reader.onload = function (e) {
        var vrstice = e.target.result.split('\n');
        vrstice.forEach(function (line) {
            if (line.trim() !== "") {
                parsajVrstico(line.trim());
                $("#next").onclick;
            }
        });
    };

    reader.readAsText(file);
}
*/


// FILE UPLOAD (NUCAVA DRUGAČNO FUNKCIJO KER JE DRUGAČE FORMATIRAN FILE (NISO ENAČBE)):
function parsajVrstico(line) {
    let parts = line.trim().split(/\s+/);
    let display = document.getElementById("display");

    if (parts.length >= 2) {
        let stSistem = parts[0].toUpperCase();
        let stevilo = parts[1];

        switch (stSistem) {
            case "DEC":
                activeDec();
                display.value = stevilo;
                convert(stevilo, "dec");
                break;
            case "OCT":
                activeOct();
                display.value = stevilo;
                convert(stevilo, "oct");
                break;
            case "HEX":
                activeHex();
                display.value = stevilo;
                convert(stevilo, "hex");
                break;
            case "BIN":
                activeBin();
                display.value = stevilo;
                convert(stevilo, "bin");
                break;
            default:
                console.error("Napaka");
                return;
        }
    }
}



function uploadFileStSistemi() {
    let fileInput = document.getElementById('fileInput');
    let file = fileInput.files[0];

    if (file) {
        let reader = new FileReader();
        let vrstice;

        reader.onload = function (e) {
            vrstice = e.target.result.split('\n');
            processLine(0);
        };

        reader.readAsText(file);

        let i = 0;
        function processLine(index) {
            let line = vrstice[index]?.trim();

            if (line !== undefined && line !== "") {
                parsajVrstico(line);
            } else {
                clearDisplay();
                clearConversions();
                decActive();
                fileInput.value = "";
                return;
            }
            i++;
            let next = document.getElementById('next');
            if (next) {
                next.onclick = function () {
                    processLine(i);
                };
            }
        }
    }
}

function openGatesFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        var enacbe = [];

        reader.onload = function (e) {
            enacbe = e.target.result.split("\n");
            displayEquations(enacbe);
        };

        reader.onerror = function (error) {
            console.error("Napaka pri odpiranju", error);
        };

        try {
            reader.readAsText(file);
        } catch (error) {
            console.error("Napaka pri odpiranju", error);
        }
    }
}

function displayEquations(enacbe) {
    var display = document.getElementById('display');
    var i = 0;

    function processEquations() {
        var enacba = enacbe[i]?.trim();

        if (enacba !== undefined && enacba !== "") {
            enacba = enacba.replace(/AND/g, "&");
            enacba = enacba.replace(/XOR/g, "^");
            enacba = enacba.replace(/OR/g, "|");
            enacba = enacba.replace(/NOT/g, "~");

            var result;
            try {
                result = evalLogicnaVrata(enacba);
                display.value = enacba + " = " + result + "\n";
            } catch (error) {
                display.value = "Error";
            }
            console.log(enacba);

            var enakost = document.getElementById('enakost');
            if (enakost) {
                enakost.onclick = function () {
                    i++;
                    if (i < enacbe.length) {
                        processEquations();
                    } else {
                        display.value = "";
                        document.getElementById('fileInput').value = "";
                    }
                };
            }
        }
    }

    processEquations();
}

