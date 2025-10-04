-- Process.lua per TileMaker - Ottimizzato per percorsi postali
-- Filtra e ottimizza i dati OSM per l'app Post-Man

-- Funzione per processare le strade
function process_way(way, layer)
    local highway = way:Find("highway")
    if not highway then return end
    
    -- Solo strade rilevanti per percorsi postali
    local relevant_highways = {
        "primary", "secondary", "tertiary", "residential",
        "unclassified", "service", "footway", "pedestrian"
    }
    
    for _, hw in ipairs(relevant_highways) do
        if highway == hw then
            layer:Set("highway", highway)
            
            -- Aggiungi informazioni utili per navigazione
            local name = way:Find("name")
            if name then
                layer:Set("name", name)
            end
            
            local postal_code = way:Find("postal_code")
            if postal_code then
                layer:Set("postal_code", postal_code)
            end
            
            return
        end
    end
end

-- Funzione per processare gli edifici
function process_way_building(way, layer)
    local building = way:Find("building")
    if not building then return end
    
    -- Solo edifici rilevanti (residenziali e uffici)
    local relevant_buildings = {
        "yes", "residential", "house", "apartments",
        "office", "commercial", "retail"
    }
    
    for _, bld in ipairs(relevant_buildings) do
        if building == bld then
            layer:Set("building", building)
            
            -- Aggiungi indirizzo se disponibile
            local addr_housenumber = way:Find("addr:housenumber")
            if addr_housenumber then
                layer:Set("addr:housenumber", addr_housenumber)
            end
            
            local addr_street = way:Find("addr:street")
            if addr_street then
                layer:Set("addr:street", addr_street)
            end
            
            local postal_code = way:Find("addr:postal_code")
            if postal_code then
                layer:Set("postal_code", postal_code)
            end
            
            return
        end
    end
end

-- Funzione per processare i punti di interesse postali
function process_node(node, layer)
    local amenity = node:Find("amenity")
    local office = node:Find("office")
    
    -- Uffici postali
    if amenity == "post_office" or office == "post_office" then
        layer:Set("type", "post_office")
        
        local name = node:Find("name")
        if name then
            layer:Set("name", name)
        end
        
        local postal_code = node:Find("postal_code")
        if postal_code then
            layer:Set("postal_code", postal_code)
        end
        
        return
    end
    
    -- Altri punti di interesse rilevanti
    local shop = node:Find("shop")
    if shop and (shop == "convenience" or shop == "supermarket") then
        layer:Set("type", "shop")
        layer:Set("shop", shop)
        
        local name = node:Find("name")
        if name then
            layer:Set("name", name)
        end
        
        return
    end
end

-- Funzione per processare le relazioni (opzionale)
function process_relation(relation, layer)
    -- Per ora non processiamo relazioni complesse
    -- Potrebbe essere utile per aree postali in futuro
end
