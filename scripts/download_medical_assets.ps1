# Download curated premium medical photography for IZCOR MEDIC AI visual assets
$assets = @{
    "cta_advisor_whatsapp.jpg" = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
    "cta_tdr_procurement.jpg" = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
    "cat_equipos_uci.jpg" = "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
    "cat_mobiliario_clinico.jpg" = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
    "cat_diagnostico_monitoreo.jpg" = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
    "cat_instrumental_quirurgico.jpg" = "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    "cat_laboratorio_diagnostico.jpg" = "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80"
    "cat_insumos_descartables.jpg" = "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"
    "pillar_calidad_certificacion.jpg" = "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80"
    "pillar_asesoria_especializada.jpg" = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
    "pillar_documentacion_osce.jpg" = "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80"
    "pillar_cobertura_nacional.jpg" = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    "sector_hospitales.jpg" = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80"
    "sector_clinicas.jpg" = "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80"
    "sector_laboratorios.jpg" = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80"
    "hero_medical_technology_3d.jpg" = "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1600&q=80"
}

$outputDir = "public/assets/ai"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir
}

foreach ($key in $assets.Keys) {
    $targetPath = Join-Path $outputDir $key
    if (!(Test-Path $targetPath)) {
        Write-Host "Downloading $key..."
        try {
            Invoke-WebRequest -Uri $assets[$key] -OutFile $targetPath -UserAgent "Mozilla/5.0"
            Write-Host "Success: $key"
        } catch {
            Write-Warning "Failed to download $key : $_"
        }
    } else {
        Write-Host "Already exists: $key"
    }
}
Write-Host "Asset download process completed."
