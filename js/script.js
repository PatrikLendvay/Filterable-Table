$(document).ready(function(){
    // Funkcia na filtrovanie tabuľky
    function filterTable() {
        // Získání všech hodnot z vybraných checkboxů
        var selectedIds = $(".idCheckbox:checked").map(function() {
            return this.value;
        }).get();
    
        var selectedStavs = $(".stavCheckbox:checked").map(function() {
            return this.value;
        }).get();
    
        // Pokud jsou vybrána nějaká zaškrtávací políčka, vynuluj obsah vyhledávacího pole
        if (selectedIds.length > 0 || selectedStavs.length > 0) {
            $("#myInput").val("");
        }
    
        var value = $("#myInput").val().toLowerCase();
    
        // Skryj všechny řádky
        $("#myTable tr").hide();
    
        // Speciální podmínka pro vyhledávání v textu, pokud nejsou vybrána žádná zaškrtávací políčka
        if (selectedIds.length === 0 && selectedStavs.length === 0) {
            $("#myTable tr").filter(function() {
                return $(this).text().toLowerCase().indexOf(value) > -1;
            }).show();
        } else {
            // Zobraz pouze řádky, které odpovídají vybraným zaškrtávacím políčkům a obsahují hledaný výraz
            $("#myTable tr").filter(function() {
                var rowId = $(this).find("td:eq(0)").text();
                var rowStav = $(this).find("td:eq(1)").text();
                var rowText = $(this).text().toLowerCase();
    
                var checkboxMatch = (selectedIds.length === 0 || selectedIds.includes(rowId)) &&
                                    (selectedStavs.length === 0 || selectedStavs.includes(rowStav));
                var textMatch = rowText.indexOf(value) > -1;
    
                // Přidejte novou podmínku, aby se zohledňoval aktuální text vyhledávání
                return checkboxMatch && (textMatch || value.trim() === "");
            }).show();
        }
    }
    
    
  
    // Funkcia na vytvorenie filtrov pre Id
    function createFilters(uniqueIds, filterContainer, checkboxClass) {
        Object.keys(uniqueIds).forEach(function(id) {
            $(filterContainer).append('<div class="checkbox"><label><input type="checkbox" class="' + checkboxClass + '" value="' + id + '"> ' + id + '</label></div>');
        });
    }
  
    // Funkcia na obsluhu udalostí pre "Select All" checkboxy
    function handleSelectAllChange(checkboxId, checkboxClass) {
        $("#" + checkboxId).on("change", function() {
            setTimeout(function() {
                $("." + checkboxClass).prop("checked", this.checked);
                $("." + checkboxClass).trigger("change");
            }.bind(this), 0);
        });
    }
  
    // Funkcia na aktualizáciu vybraných hodnôt v div-e
    function updateSelectedValues(selectedIds, selectedStavs) {
        $("#selectedValues").empty();  // Vymažte staré hodnoty
  
        // Pridajte vybrané ID do div-u
        selectedIds.forEach(function(id) {
            addGenderInfoToSelected(id);
        });
  
        // Pridajte vybrané Stavy do div-u s <span> a triedou circle_color
        selectedStavs.forEach(function(stav) {
            var spanClass = getSpanClassByOrderStatus(stav);
            $("#selectedValues").append('<div class="selectedValue selected_stav"><span class="circle_color ' + spanClass + '"></span>' + stav + ' <button class="removeBtn" data-type="stav" data-value="' + stav + '"></button></div>');
        });
  
        // Filtrovanie podľa Id alebo Stav (logika OR)
        if (selectedIds.length > 0 || selectedStavs.length > 0) {
            $("#myTable tr").hide();
            $("#myTable tr").filter(function() {
                var rowId = $(this).find("td:eq(0)").text();
                var rowStav = $(this).find("td:eq(1)").text();
                return (selectedIds.length === 0 || selectedIds.includes(rowId)) && (selectedStavs.length === 0 || selectedStavs.includes(rowStav));
            }).show();
        } else {
            $("#myTable tr").show();
        }
  
        // Ak je aspoň jeden checkbox ručne odznačený, odznačte "Select All"
        if ($(".idCheckbox:not(:checked)").length > 0) {
            $("#selectAllId").prop("checked", false);
        }
  
        if ($(".stavCheckbox:not(:checked)").length > 0) {
            $("#selectAllStav").prop("checked", false);
        }
    }
  
    // Funkcia na získanie správnej triedy <span> podľa stavu objednávky
    function getSpanClassByOrderStatus(orderStatus) {
        switch (orderStatus) {
            case "Unpaid":
                return "red";
            case "Processing":
                return "orange";
            case "Shipped":
                return "blue";
            case "Processed":
                return "green";
            default:
                return "";
        }
    }
  
    // Funkcia na pridanie ikony podľa pohlavia
    function addGenderIcon(gender) {
        var iconClass = (gender === "M") ? "icon_male" : "icon_female";
        return '<span class="' + iconClass + ' person_icon"></span>';
    }

    // Funkcia na pridanie informácií o pohlaví do vybraných hodnôt
    function addGenderInfoToSelected(id) {
        var gender = $("#myTable tr:contains(" + id + ") td:eq(4)").text(); // Získaj pohlavie podľa ID
        var genderIconClass = (gender === "M") ? "icon_male" : "icon_female";
        var genderInfo = '<span class="' + genderIconClass + ' person_icon"></span>';

        $("#selectedValues").append('<div class="selectedValue selected_id">' + genderInfo + id + ' <button class="removeBtn" data-type="id" data-value="' + id + '">×</button></div>');
    }
  
    // Obsluha udalostí
    $("#myInput").on("keyup", filterTable);
  
    var uniqueIds = {};
    var uniqueStavs = {};
  
    // Prejdi všetky riadky a získaj unikátne hodnoty pre Id a Stav
    $("#myTable tr").each(function() {
        var rowId = $(this).find("td:eq(0)").text();
        var rowStav = $(this).find("td:eq(1)").text();
  
        uniqueIds[rowId] = true;
        uniqueStavs[rowStav] = true;
    });
  
    // Vytvor filtre pre Id a Stav
    createFilters(uniqueIds, "#filterById_group", "idCheckbox");
    createFilters(uniqueStavs, "#filterByStav_group", "stavCheckbox");
  
    // Obsluha udalostí pre "Select All" checkboxy
    handleSelectAllChange("selectAllId", "idCheckbox");
    handleSelectAllChange("selectAllStav", "stavCheckbox");
  
    // Udržujte vybrané hodnoty v div-e a pridajte tlačidlo X
    $(".idCheckbox, .stavCheckbox").on("change", function() {
        var selectedIds = $(".idCheckbox:checked").map(function() {
            var id = this.value;
            addGenderInfoToSelected(id);
            return id;
        }).get();
  
        var selectedStavs = $(".stavCheckbox:checked").map(function() {
            return this.value;
        }).get();
  
        // Vyprázdni vybrané hodnoty pred aktualizáciou
        $("#selectedValues").empty();
  
        // Aktualizujte vybrané hodnoty
        selectedIds.forEach(function(id) {
            addGenderInfoToSelected(id);
        });
  
        updateSelectedValues(selectedIds, selectedStavs);
  
        // Aktualizujte zobrazenie vybraných hodnôt v konkrétnom formáte
        var selectedValuesBox = $("#selectedValuesBox");
        if (selectedIds.length > 0 || selectedStavs.length > 0) {
            selectedValuesBox.show();
        } else {
            selectedValuesBox.hide();
        }
    });
  
    // Odstráň vybranú hodnotu z div-u po kliknutí na tlačidlo X
    $("#selectedValues").on("click", ".removeBtn", function() {
        var type = $(this).data("type");
        var value = $(this).data("value");
  
        // Odstráň checkbox
        $("." + type + "Checkbox[value='" + value + "']").prop("checked", false);
  
        // Odstráň hodnotu z div-u
        $(this).parent().remove();
  
        // Znovu vyfiltrujte podľa vybraných hodnôt
        $(".idCheckbox, .stavCheckbox").trigger("change");
    });
  
    // Pridaj ikony pre pohlavie
    $("#myTable tr").each(function() {
        var gender = $(this).find("td:eq(4)").text();
        var genderIcon = addGenderIcon(gender);
        $(this).find("td:eq(0)").prepend(genderIcon);
    });
  
    // Aktualizujte zobrazenie stavu objednávky s príslušným <span>
    $("#myTable tr").each(function() {
        var orderStatus = $(this).find("td:eq(1)").text();
        var spanClass = getSpanClassByOrderStatus(orderStatus);
        $(this).find("td:eq(1)").html('<span class="circle_color ' + spanClass + '"></span>' + orderStatus);
    });
  });