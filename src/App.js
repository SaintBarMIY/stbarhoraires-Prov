import React, { useState, useEffect } from 'react';

// Le contenu du fichier GPU001.TXT est pré-chargé ici pour la démonstration.
// Ce contenu sera remplacé par le fichier téléchargé par l'utilisateur.
const preloadedFileContent = `7060,"2A","MOM","DDUR","G31",5,6,,
7060,"2A","MOM","DDUR","G31",5,7,,
7060,"2E","MAE","DDUR",,5,6,,
7060,"2E","MAE","DDUR",,5,7,,
7060,"2F","ENH","DDUR",,5,6,,
7060,"2F","ENH","DDUR",,5,7,,
7060,"2G","LMR","REM",,5,6,,
7060,"2G","LMR","REM",,5,7,,
7060,"2H","CHE","REM",,5,6,,
7060,"2H","CHE","REM",,5,7,,
7060,"2I","LUN","REM",,5,6,,
7060,"2I","LUN","REM",,5,7,,
7060,"2J","BRF","REM","C23",5,6,,
7060,"2J","BRF","REM","C23",5,7,,
7060,"2K","DUG","REM",,5,6,,
7060,"2K","DUG","REM",,5,7,,
7060,"2L","AEM","REM",,5,6,,
7060,"2L","AEM","REM",,5,7,,
7060,"2B","MIR","REM",,5,6,,
7060,"2B","MIR","REM",,5,7,,
7060,"2C","SIA","REM",,5,6,,
7060,"2C","SIA","REM",,5,7,,
7060,"2D","BRM","DDUR",,5,6,,
7060,"2D","BRM","DDUR",,5,7,,
7060,"2M","DIA","REM",,5,6,,
7060,"2M","DIA","REM",,5,7,,
7060,"2A","RIM","REM",,5,6,,
7060,"2A","RIM","REM",,5,7,,
7060,"2B","DIM","REM",,5,6,,
7060,"2B","DIM","REM",,5,7,,
7060,"2B","ANC","REM",,5,6,,
7060,"2B","ANC","REM",,5,7,,
7060,"2A","MNM","DDUR","G31",5,6,,
7060,"2A","MNM","DDUR","G31",5,7,,
7060,"2B","BLS","DDUR",,5,6,,
7060,"2B","BLS","DDUR",,5,7,,
7060,"2L","HOA","REM",,5,6,,
7060,"2L","HOA","REM",,5,7,,
7063,"8B","MOM","DDUR",,2,4,,
7063,"8B","BRM","DDUR",,2,4,,
7063,"8B",,"DDUR",,2,4,,
7063,"8B","MAE","DDUR",,2,4,,
7063,"8B","MNM","DDUR",,2,4,,
7063,"8B","BLS","DDUR","G33",2,4,,
7071,"8A","BLV","HORA",,2,5,,
7071,"8A","BLV","HORA",,2,6,,
7071,"8A","BLV","HORA",,2,7,,
7071,"8A","BLV","HORA",,5,6,,
7071,"8A","BLV","HORA",,5,7,,
7071,"8A","MIY","HORA",,2,5,,
7071,"8A","MIY","HORA",,2,6,,
7071,"8A","MIY","HORA",,2,7,,
7071,"8A","MIY","HORA",,5,6,,
7071,"8A","MIY","HORA",,5,7,,
7071,"8A","EGF","HORA",,2,5,,
7071,"8A","EGF","HORA",,2,6,,
7071,"8A","EGF","HORA",,2,7,,
7071,"8A","EGF","HORA",,5,6,,
7071,"8A","EGF","HORA",,5,7,,
7002,"7A","SIC","GEOM","HELM",2,5,,
7002,"7A","SIC","GEOM","HELM",2,6,,
7002,"7A","SIC","GEOM","HELM",3,1,,
7002,"7A","SIC","GEOM","HELM",3,2,,
7002,"7A","SIC","GEOM","HELM",5,5,,
7002,"7A","SIC","GEOM","HELM",5,6,,
7003,"7A","DRL","ALGE","HELM",2,3,,
7003,"7A","DRL","ALGE","HELM",2,4,,
7003,"7A","DRL","ALGE","HELM",3,3,,
7003,"7A","DRL","ALGE","HELM",3,4,,
7003,"7A","DRL","ALGE","HELM",4,1,,
7003,"7A","DRL","ALGE","HELM",4,2,,
7004,"7A","TAM","ANAL","HELM",1,1,,
7004,"7A","TAM","ANAL","HELM",1,2,,
7004,"7A","TAM","ANAL","HELM",4,5,,
7004,"7A","TAM","ANAL","HELM",4,6,,
7004,"7A","TAM","ANAL","HELM",5,3,,
7004,"7A","TAM","ANAL","HELM",5,4,,
7005,"7A","BOM","TRIGO","HELM",1,3,,
7005,"7A","BOM","TRIGO","HELM",1,4,,
7005,"7A","BOM","TRIGO","HELM",4,7,,
7006,"7B","LAF","TRIGO","HELS",1,5,,
7006,"7B","LAF","TRIGO","HELS",4,5,,
7006,"7B","LAF","TRIGO","HELS",4,6,,
7007,"7B","DEF","ANAL","HELS",1,3,,
7007,"7B","DEF","ANAL","HELS",1,4,,
7007,"7B","DEF","ANAL","HELS",2,5,,
7007,"7B","DEF","ANAL","HELS",2,6,,
7007,"7B","DEF","ANAL","HELS",4,7,,
7008,"7A","DMS","ANGL","HELM",1,5,,
7008,"7A","DMS","ANGL","HELM",1,6,,
7009,"7B","DMS","ANGL","HELS",2,3,,
7009,"7B","DMS","ANGL","HELS",2,4,,
7010,"7B","BAM","ALGE","HELS",2,7,,
7010,"7B","BAM","ALGE","HELS",5,5,,
7010,"7B","BAM","ALGE","HELS",5,6,,
7011,"7A","CAF","INFO","C21",4,3,,
7011,"7A","CAF","INFO","C21",4,4,,
7012,"7B","HAL","CHI","HELS",1,1,,
7012,"7B","HAL","CHI","HELS",1,2,,
7012,"7B","HAL","CHI","HELS",2,1,,
7012,"7B","HAL","CHI","HELS",2,2,,
7012,"7B","HAL","CHI","HELS",3,1,,
7012,"7B","HAL","CHI","HELS",3,2,,
7013,"7B","BRD","BIO","HELS",4,3,,
7013,"7B","BRD","BIO","HELS",4,4,,
7014,"7B","GOV","BIO","HELS",3,3,,
7014,"7B","GOV","BIO","HELS",3,4,,
7014,"7B","GOV","BIO","HELS",5,1,,
7014,"7B","GOV","BIO","HELS",5,2,,
7015,"7A","GOV","CHI","HELM",2,1,,
7015,"7A","GOV","CHI","HELM",2,2,,
7016,"7A","PRL","PHY","HELM",2,7,,
7016,"7A","PRL","PHY","HELM",5,1,,
7016,"7A","PRL","PHY","HELM",5,2,,
7017,"7B","PRL","PHY","HELS",1,6,,
7017,"7B","PRL","PHY","HELS",1,7,,
7017,"7B","PRL","PHY","HELS",4,1,,
7017,"7B","PRL","PHY","HELS",4,2,,
7017,"7B","PRL","PHY","HELS",5,3,,
7017,"7B","PRL","PHY","HELS",5,4,,
2002,"2A","BOP","REL","F21",4,5,,
2002,"2A","BOP","REL","F21",5,5,,
2003,"2B","BOP","REL","G41",2,5,,
2003,"2B","BOP","REL","G41",3,1,,
2004,"2C","BOP","REL","G42",1,7,,
2004,"2C","BOP","REL","G42",5,2,,
2005,"2D","BOP","REL","F33",2,8,,
2005,"2D","BOP","REL","F33",4,6,,
2006,"2E","JAJ","REL","F26",2,2,,
2006,"2E","JAJ","REL","F26",4,6,,
2007,"2F","ANM","REL","G43",2,4,,
2007,"2F","ANM","REL","G43",4,6,,
2008,"2G","BOP","REL","F35",1,3,,
2008,"2G","BOP","REL","F35",2,4,,
2009,"2H","BOP","REL","F38",2,7,,
2009,"2H","BOP","REL","F38",3,2,,
2010,"2I","BOP","REL","G44",1,5,,
2010,"2I","BOP","REL","G44",3,3,,
2011,"2J","ANC","REL","C23",2,7,,
2011,"2J","ANC","REL","C23",4,7,,
2012,"2K","ANC","REL","F34",1,7,,
2012,"2K","ANC","REL","F34",5,3,,
2013,"2L","BOP","REL","F32",1,4,,
2013,"2L","BOP","REL","F32",2,6,,
2014,"2M","ANC","REL","F31",3,1,,
2014,"2M","ANC","REL","F31",4,1,,
2015,"2A","POE","FRA","F21",1,3,,
2015,"2A","POE","FRA","F21",1,5,,
2015,"2A","POE","FRA","F21",2,8,,
2015,"2A","POE","FRA","F21",3,1,,
2015,"2A","POE","FRA","F21",3,2,,
2016,"2B","ANM","FRA","G41",1,5,,
2016,"2B","ANM","FRA","G41",1,6,,
2016,"2B","ANM","FRA","G41",2,3,,
2016,"2B","ANM","FRA","G41",4,1,,
2016,"2B","ANM","FRA","G41",5,1,,
2017,"2C","AEM","FRA","G42",2,5,,
2017,"2C","AEM","FRA","G42",2,6,,
2017,"2C","AEM","FRA","G42",3,4,,
2017,"2C","AEM","FRA","G42",4,3,,
2017,"2C","AEM","FRA","G42",5,3,,
2018,"2D","DRF","FRA","F33",1,4,,
2018,"2D","DRF","FRA","F33",1,6,,
2018,"2D","DRF","FRA","F33",2,6,,
2018,"2D","DRF","FRA","F33",4,4,,
2018,"2D","DRF","FRA","F33",5,3,,
2019,"2E","JAJ","FRA","F26",1,4,,
2019,"2E","JAJ","FRA","F26",2,3,,
2019,"2E","JAJ","FRA","F26",2,4,,
2019,"2E","JAJ","FRA","F26",4,2,,
2019,"2E","JAJ","FRA","F26",5,2,,
2020,"2F","ANM","FRA","G43",1,2,,
2020,"2F","ANM","FRA","G43",2,7,,
2020,"2F","ANM","FRA","G43",4,3,,
2020,"2F","ANM","FRA","G43",4,4,,
2020,"2F","ANM","FRA","G43",5,2,,
2021,"2G","DRF","FRA","F35",2,5,,
2021,"2G","DRF","FRA","F35",3,1,,
2021,"2G","DRF","FRA","F35",3,2,,
2021,"2G","DRF","FRA","F35",4,1,,
2021,"2G","DRF","FRA","F35",5,5,,
2022,"2H","DIM","FRA","F38",1,3,,
2022,"2H","DIM","FRA","F38",2,5,,
2022,"2H","DIM","FRA","F38",3,4,,
2022,"2H","DIM","FRA","F38",4,7,,
2022,"2H","DIM","FRA","F38",5,5,,
2023,"2I","AEM","FRA","G44",2,8,,
2023,"2I","AEM","FRA","G44",3,1,,
2023,"2I","AEM","FRA","G44",4,1,,
2023,"2I","AEM","FRA","G44",4,2,,
2023,"2I","AEM","FRA","G44",5,1,,
2024,"2J","PZO","FRA","C23",1,2,,
2024,"2J","PZO","FRA","C23",1,6,,
2024,"2J","PZO","FRA","C23",2,3,,
2024,"2J","PZO","FRA","C23",3,1,,
2024,"2J","PZO","FRA","C23",3,2,,
2024,"2J","PZO","FRA","C23",4,1,,
2024,"2J","PZO","FRA","C23",5,3,,
2024,"2J","PZO","FRA","C23",5,4,,
2025,"2K","ANC","FRA","F34",2,1,,
2025,"2K","ANC","FRA","F34",3,3,,
2025,"2K","ANC","FRA","F34",3,4,,
2025,"2K","ANC","FRA","F34",4,2,,
2025,"2K","ANC","FRA","F34",5,4,,
2026,"2L","ANC","FRA","F32",2,3,,
2026,"2L","ANC","FRA","F32",3,2,,
2026,"2L","ANC","FRA","F32",4,5,,
2026,"2L","ANC","FRA","F32",4,6,,
2026,"2L","ANC","FRA","F32",5,1,,
2027,"2M","JAJ","FRA","F31",1,5,,
2027,"2M","JAJ","FRA","F31",2,1,,
2027,"2M","JAJ","FRA","F31",4,3,,
2027,"2M","JAJ","FRA","F31",4,4,,
2027,"2M","JAJ","FRA","F31",5,1,,
2028,"2A","PRP","MAT","F21",1,4,,
2028,"2A","PRP","MAT","F21",2,3,,
2028,"2A","PRP","MAT","F21",4,1,,
2028,"2A","PRP","MAT","F21",5,1,,
2028,"2A","PRP","MAT","F21",5,2,,
2029,"2B","PRP","MAT","G41",1,2,,
2029,"2B","PRP","MAT","G41",1,3,,
2029,"2B","PRP","MAT","G41",2,6,,
2029,"2B","PRP","MAT","G41",5,3,,
2029,"2B","PRP","MAT","G41",5,5,,
2030,"2C","MOM","MAT","G42",1,4,,
2030,"2C","MOM","MAT","G42",2,1,,
2030,"2C","MOM","MAT","G42",2,7,,
2030,"2C","MOM","MAT","G42",4,7,,
2030,"2C","MOM","MAT","G42",5,5,,
2031,"2D","HOA","MAT","F33",1,3,,
2031,"2D","HOA","MAT","F33",2,7,,
2031,"2D","HOA","MAT","F33",4,1,,
2031,"2D","HOA","MAT","F33",4,3,,
2031,"2D","HOA","MAT","F33",5,1,,
2032,"2E","LUN","MAT","F26",1,2,,
2032,"2E","LUN","MAT","F26",2,7,,
2032,"2E","LUN","MAT","F26",4,4,,
2032,"2E","LUN","MAT","F26",4,5,,
2032,"2E","LUN","MAT","F26",5,3,,
2033,"2F","SIA","MAT","G43",1,3,,
2033,"2F","SIA","MAT","G43",2,1,,
2033,"2F","SIA","MAT","G43",3,3,,
2033,"2F","SIA","MAT","G43",3,4,,
2033,"2F","SIA","MAT","G43",4,1,,
2034,"2G","HOA","MAT","F35",1,4,,
2034,"2G","HOA","MAT","F35",2,3,,
2034,"2G","HOA","MAT","F35",2,6,,
2034,"2G","HOA","MAT","F35",4,6,,
2034,"2G","HOA","MAT","F35",5,2,,
2035,"2H","MIR","MAT","F38",1,5,,
2035,"2H","MIR","MAT","F38",1,7,,
2035,"2H","MIR","MAT","F38",2,1,,
2035,"2H","MIR","MAT","F38",3,1,,
2035,"2H","MIR","MAT","F38",4,3,,
2036,"2I","MOM","MAT","G44",1,1,,
2036,"2I","MOM","MAT","G44",1,3,,
2036,"2I","MOM","MAT","G44",2,3,,
2036,"2I","MOM","MAT","G44",4,4,,
2036,"2I","MOM","MAT","G44",5,4,,
2037,"2J","SIA","MAT","C23",1,1,,
2037,"2J","SIA","MAT","C23",1,4,,
2037,"2J","SIA","MAT","C23",2,5,,
2037,"2J","SIA","MAT","C23",2,6,,
2037,"2J","SIA","MAT","C23",4,3,,
2037,"2J","SIA","MAT","C23",5,2,,
2038,"2K","LUN","MAT","F34",1,1,,
2038,"2K","LUN","MAT","F34",1,5,,
2038,"2K","LUN","MAT","F34",2,8,,
2038,"2K","LUN","MAT","F34",4,1,,
2038,"2K","LUN","MAT","F34",5,1,,
2039,"2L","HOA","MAT","F32",1,2,,
2039,"2L","HOA","MAT","F32",1,5,,
2039,"2L","HOA","MAT","F32",2,1,,
2039,"2L","HOA","MAT","F32",4,2,,
2039,"2L","HOA","MAT","F32",5,4,,
2040,"2M","MIR","MAT","F31",1,6,,
2040,"2M","MIR","MAT","F31",2,3,,
2040,"2M","MIR","MAT","F31",3,2,,
2040,"2M","MIR","MAT","F31",4,5,,
2040,"2M","MIR","MAT","F31",4,6,,
2041,"2A","BLS","EDM","F21",1,2,,
2041,"2A","BLS","EDM","F21",2,7,,
2041,"2A","BLS","EDM","F21",4,2,,
2041,"2A","BLS","EDM","F21",4,6,,
2042,"2B","MNM","EDM","G41",1,7,,
2042,"2B","MNM","EDM","G41",3,2,,
2042,"2B","MNM","EDM","G41",4,2,,
2042,"2B","MNM","EDM","G41",4,4,,
2043,"2C","DRF","EDM","G42",1,1,,
2043,"2C","DRF","EDM","G42",1,3,,
2043,"2C","DRF","EDM","G42",4,6,,
2043,"2C","DRF","EDM","G42",5,4,,
2044,"2D","MNM","EDM","F33",1,5,,
2044,"2D","MNM","EDM","F33",2,1,,
2044,"2D","MNM","EDM","F33",2,2,,
2044,"2D","MNM","EDM","F33",3,4,,
2045,"2E","VHC","EDM","F26",1,3,,
2045,"2E","VHC","EDM","F26",1,5,,
2045,"2E","VHC","EDM","F26",4,3,,
2045,"2E","VHC","EDM","F26",5,5,,
2046,"2F","MNM","EDM","G43",1,1,,
2046,"2F","MNM","EDM","G43",1,6,,
2046,"2F","MNM","EDM","G43",4,7,,
2046,"2F","MNM","EDM","G43",5,4,,
2046,,"VHC",,,1,1,,
2046,,"VHC",,,1,6,,
2046,,"VHC",,,4,7,,
2046,,"VHC",,,5,4,,
2047,"2G","DRF","EDM","F35",1,2,,
2047,"2G","DRF","EDM","F35",2,7,,
2047,"2G","DRF","EDM","F35",4,5,,
2047,"2G","DRF","EDM","F35",5,1,,
2048,"2H","MNM","EDM","F38",1,2,,
2048,"2H","MNM","EDM","F38",2,3,,
2048,"2H","MNM","EDM","F38",4,1,,
2048,"2H","MNM","EDM","F38",5,1,,
2049,"2I","DNN","EDM","G44",1,6,,
2049,"2I","DNN","EDM","G44",2,7,,
2049,"2I","DNN","EDM","G44",4,3,,
2049,"2I","DNN","EDM","G44",5,2,,
2050,"2J","DMC","EDM","C23",1,3,,
2050,"2J","DMC","EDM","C23",3,3,,
2050,"2J","DMC","EDM","C23",3,4,,
2050,"2J","DMC","EDM","C23",5,5,,
2051,"2K","MNM","EDM","F34",1,3,,
2051,"2K","MNM","EDM","F34",3,1,,
2051,"2K","MNM","EDM","F34",4,3,,
2051,"2K","MNM","EDM","F34",5,2,,
2052,"2L","DNN","EDM","F32",1,7,,
2052,"2L","DNN","EDM","F32",2,5,,
2052,"2L","DNN","EDM","F32",4,1,,
2052,"2L","DNN","EDM","F32",5,3,,
2053,"2M","DRF","EDM","F31",3,3,,
2053,"2M","DRF","EDM","F31",3,4,,
2053,"2M","DRF","EDM","F31",4,2,,
2053,"2M","DRF","EDM","F31",5,2,,
2054,"2A","TAR","SCI","F21",3,3,,
2054,"2A","TAR","SCI","F21",4,4,,
2054,"2A","TAR","SCI","F21",5,3,,
2055,"2B","TAR","SCI","G41",1,4,,
2055,"2B","TAR","SCI","G41",2,8,,
2055,"2B","TAR","SCI","G41",4,3,,
2056,"2C","AKM","SCI","G42",1,2,,
2056,"2C","AKM","SCI","G42",3,3,,
2056,"2C","AKM","SCI","G42",4,1,,
2057,"2D","TAR","SCI","F33",1,7,,
2057,"2D","TAR","SCI","F33",2,5,,
2057,"2D","TAR","SCI","F33",5,5,,
2058,"2E","BLT","SCI","F26",2,1,,
2058,"2E","BLT","SCI","F26",3,3,,
2058,"2E","BLT","SCI","F26",5,1,,
2059,"2F","AKM","SCI","G43",2,3,,
2059,"2F","AKM","SCI","G43",4,2,,
2059,"2F","AKM","SCI","G43",5,1,,
2060,"2G","PHS","SCI","F35",1,1,,
2060,"2G","PHS","SCI","F35",2,8,,
2060,"2G","PHS","SCI","F35",4,3,,
2061,"2H","PHS","SCI","F38",1,4,,
2061,"2H","PHS","SCI","F38",2,6,,
2061,"2H","PHS","SCI","F38",4,2,,
2062,"2I","BLT","SCI","G44",1,2,,
2062,"2I","BLT","SCI","G44",3,2,,
2062,"2I","BLT","SCI","G44",5,5,,
2063,"2J","SEF","SCI","C23",2,2,,
2063,"2J","SEF","SCI","C23",4,4,,
2063,"2J","SEF","SCI","C23",5,1,,
2064,"2K","TAR","SCI","F34",1,2,,
2064,"2K","TAR","SCI","F34",2,7,,
2064,"2K","TAR","SCI","F34",3,2,,
2065,"2L","BLT","SCI","F32",1,3,,
2065,"2L","BLT","SCI","F32",2,4,,
2065,"2L","BLT","SCI","F32",5,2,,
2066,"2M","TAR","SCI","F31",1,3,,
2066,"2M","TAR","SCI","F31",2,4,,
2066,"2M","TAR","SCI","F31",4,7,,
7067,"2B","MAE","ANGL","G41",2,7,,
7072,"3A","HOA","REM",,2,8,,
7072,"3B","HOA","REM",,2,8,,
7072,"3C","HOA","REM",,2,8,,
7072,"3D","HOA","REM",,2,8,,
7072,"3E","HOA","REM",,2,8,,
7072,"3F","HOA","REM",,2,8,,
7072,"3G","HOA","REM",,2,8,,
7072,"3H","HOA","REM",,2,8,,
7072,"3I","HOA","REM",,2,8,,
7072,"3J","HOA","REM",,2,8,,
7072,"3K","HOA","REM",,2,8,,
7072,"3L","HOA","REM",,2,8,,
7072,"3A","VAS","REM","C01",2,8,,
7072,"3B","VAS","REM","C01",2,8,,
7072,"3C","VAS","REM","C01",2,8,,
7072,"3D","VAS","REM","C01",2,8,,
7072,"3E","VAS","REM","C01",2,8,,
7072,"3F","VAS","REM","C01",2,8,,
7072,"3G","VAS","REM","C01",2,8,,
7072,"3H","VAS","REM","C01",2,8,,
7072,"3I","VAS","REM","C01",2,8,,
7072,"3J","VAS","REM","C01",2,8,,
7072,"3K","VAS","REM","C01",2,8,,
7072,"3A","BRM","REM",,2,8,,
7072,"3B","BRM","REM",,2,8,,
7072,"3C","BRM","REM",,2,8,,
7072,"3D","BRM","REM",,2,8,,
7072,"3E","BRM","REM",,2,8,,
7072,"3F","BRM","REM",,2,8,,
7072,"3G","BRM","REM",,2,8,,
7072,"3H","BRM","REM",,2,8,,
7072,"3I","BRM","REM",,2,8,,
7072,"3J","BRM","REM",,2,8,,
7072,"3K","BRM","REM",,2,8,,
7072,"3A","MAR","REM",,2,8,,
7072,"3B","MAR","REM",,2,8,,
7072,"3C","MAR","REM",,2,8,,
7072,"3D","MAR","REM",,2,8,,
7072,"3E","MAR","REM",,2,8,,
7072,"3F","MAR","REM",,2,8,,
7072,"3G","MAR","REM",,2,8,,
7072,"3H","MAR","REM",,2,8,,
7072,"3I","MAR","REM",,2,8,,
7072,"3J","MAR","REM",,2,8,,
7072,"4A","LHV","REM",,2,8,,
7072,"4B","LHV","REM",,2,8,,
7072,"4C","LHV","REM",,2,8,,
7072,"4D","LHV","REM",,2,8,,
7072,"4E","LHV","REM",,2,8,,
7072,"4F","LHV","REM",,2,8,,
7072,"4G","LHV","REM",,2,8,,
7072,"4H","LHV","REM",,2,8,,
7072,"4I","LHV","REM",,2,8,,
7072,"4J","LHV","REM",,2,8,,
7072,"4K","LHV","REM",,2,8,,
7072,"4L","LHV","REM",,2,8,,
7073,"3C","GON","REM",,2,7,,
7073,"3D","GON","REM",,2,7,,
7073,"3E","GON","REM",,2,7,,
7073,"3G","GON","REM",,2,7,,
7073,"3H","GON","REM",,2,7,,
7073,"3J","GON","REM",,2,7,,
7073,"3K","GON","REM",,2,7,,
7073,"3L","GON","REM",,2,7,,
7073,,"VAS","REM",,2,7,,
7073,,"BRM","REM",,2,7,,
7073,"4A","HAL","REM",,2,7,,
7073,"4D","HAL","REM",,2,7,,
7073,"4E","HAL","REM",,2,7,,
7073,"4G","HAL","REM",,2,7,,
7073,"4H","HAL","REM",,2,7,,
7073,"4J","HAL","REM",,2,7,,
7073,"4K","HAL","REM",,2,7,,
7073,"4L","HAL","REM",,2,7,,
7073,,"HEE","REM",,2,7,,
7073,,"LEP","REM",,2,7,,
7074,"3A","MAF","REM","C01",1,8,,
7074,"3B","MAF","REM","C01",1,8,,
7074,"3C","MAF","REM","C01",1,8,,
7074,"3D","MAF","REM","C01",1,8,,
7074,"3E","MAF","REM","C01",1,8,,
7074,"3F","MAF","REM","C01",1,8,,
7074,"3G","MAF","REM","C01",1,8,,
7074,"3H","MAF","REM","C01",1,8,,
7074,"3I","MAF","REM","C01",1,8,,
7074,"3J","MAF","REM","C01",1,8,,
7074,"3K","MAF","REM","C01",1,8,,
7074,"3L","MAF","REM","C01",1,8,,
7074,"4A","ENH","REM","B21",1,8,,
7074,"4B","ENH","REM","B21",1,8,,
7074,"4C","ENH","REM","B21",1,8,,
7074,"4D","ENH","REM","B21",1,8,,
7074,"4E","ENH","REM","B21",1,8,,
7074,"4F","ENH","REM","B21",1,8,,
7074,"4G","ENH","REM","B21",1,8,,
7074,"4H","ENH","REM","B21",1,8,,
7074,"4I","ENH","REM","B21",1,8,,
7074,"4J","ENH","REM","B21",1,8,,
7074,"4K","ENH","REM","B21",1,8,,
7074,"4L","ENH","REM","B21",1,8,,
7074,"4A","BIL","REM",,1,8,,
7074,,"MAR","REM",,1,8,,
7075,"8E","VIV","EQUI",,5,1,,
7075,"8E","DPT","EQUI",,5,1,,
7076,"8C","JEC","ETUD",,4,3,,
7076,"8C","SAL","ETUD",,4,3,,
`;

// Composant Modal pour afficher l'emploi du temps détaillé
const ScheduleModal = ({ entityName, scheduleType, scheduleData, onClose }) => {
  // Mappages pour les jours et les heures pour une meilleure lisibilité
  const dayMap = {
    '1': 'Lundi', '2': 'Mardi', '3': 'Mercredi', '4': 'Jeudi', '5': 'Vendredi',
    '6': 'Samedi', '7': 'Dimanche'
  };

  const hourMap = {
    '1': '8h20-9h10',
    '2': '9h10-10h00',
    '3': '10h20-11h10',
    '4': '11h10-12h00',
    '5': '13h10-14h00',
    '6': '14h00-14h50',
    '7': '15h05-15h55',
    '8': '15h55-16h45'
  };

  // Définir les jours et les heures pour les en-têtes du tableau
  const daysOfWeek = ['1', '2', '3', '4', '5']; // Lundi à Vendredi
  const hoursOfDay = ['1', '2', '3', '4', '5', '6', '7', '8']; // Heures 1 à 8

  // Créer une grille pour l'emploi du temps
  const scheduleGrid = {};
  daysOfWeek.forEach(day => {
    scheduleGrid[day] = {};
    hoursOfDay.forEach(hour => {
      scheduleGrid[day][hour] = null; // Initialiser les cellules comme vides
    });
  });

  // Remplir la grille avec les données de l'emploi du temps
  scheduleData.forEach(entry => {
    const day = entry.day;
    const hour = entry.hour;

    if (daysOfWeek.includes(day) && hoursOfDay.includes(hour)) {
      // Le contenu de la cellule dépend du type d'entité
      let cellContent = '';
      if (scheduleType === 'professors') {
        cellContent = (
          <>
            <div className="font-semibold text-blue-800">{entry.course}</div>
            <div className="text-gray-700 text-xs">Classes: {entry.class}</div>
            <div className="text-gray-700 text-xs">Local: {entry.room}</div>
          </>
        );
      } else if (scheduleType === 'classes') {
        cellContent = (
          <>
            <div className="font-semibold text-green-800">{entry.course}</div>
            <div className="text-gray-700 text-xs">Prof: {entry.professorName}</div>
            <div className="text-gray-700 text-xs">Local: {entry.room}</div>
          </>
        );
      } else if (scheduleType === 'rooms') {
        cellContent = (
          <>
            <div className="font-semibold text-purple-800">{entry.course}</div>
            <div className="text-gray-700 text-xs">Prof: {entry.professorName}</div>
            <div className="text-gray-700 text-xs">Classes: {entry.class}</div>
          </>
        );
      }
      scheduleGrid[day][hour] = cellContent;
    }
  });

  // Définir le titre de la modale
  let modalTitle = '';
  switch (scheduleType) {
    case 'professors':
      modalTitle = `Emploi du temps de ${entityName}`;
      break;
    case 'classes':
      modalTitle = `Emploi du temps de la classe ${entityName}`;
      break;
    case 'rooms':
      modalTitle = `Emploi du temps du local ${entityName}`;
      break;
    default:
      modalTitle = `Détails de l'emploi du temps pour ${entityName}`;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto"> {/* Augmenté la largeur max */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
          >
            &times;
          </button>
        </div>
        {scheduleData.length > 0 ? (
          <div className="overflow-x-auto max-h-[70vh] pb-4"> {/* Hauteur max pour le défilement */}
            <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr> {/* Début de la ligne d'en-tête */}
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Heure / Jour</th>
                  {daysOfWeek.map(dayKey => (<th key={dayKey} className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">{dayMap[dayKey]}</th>))}
                </tr> {/* Fin de la ligne d'en-tête */}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hoursOfDay.map(hourKey => (
                  <tr key={hourKey} className="h-20"> {/* Début de chaque ligne d'heure */}
                    <td className="py-2 px-3 text-sm text-gray-800 font-medium border-r border-gray-200">{hourMap[hourKey]}</td>
                    {daysOfWeek.map(dayKey => (<td key={`${dayKey}-${hourKey}`} className="py-2 px-3 text-sm text-gray-800 align-top border-r border-gray-200">{scheduleGrid[dayKey][hourKey]}</td>))}
                  </tr> /* Fin de chaque ligne d'heure */
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Aucun emploi du temps trouvé pour cette entité.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Clé spéciale pour les professeurs dont le sigle est manquant ou invalide
const UNKNOWN_PROFESSOR_KEY = 'INCONNU';

function App() {
  const [professorHours, setProfessorHours] = useState({}); // Total hours for professors (unique slots)
  const [allSchedules, setAllSchedules] = useState({ professors: {}, classes: {}, rooms: {} }); // Detailed schedules for all entities
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('professors'); // 'professors', 'classes', 'rooms'
  const [selectedEntity, setSelectedEntity] = useState(null); // Name of selected professor, class, or room
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Aucun fichier sélectionné"); // Pour afficher le nom du fichier

  useEffect(() => {
    // Charge le contenu pré-défini au démarrage si aucun fichier n'a été chargé
    // Cela permet à l'application d'être fonctionnelle sans téléchargement initial
    processFileContent(preloadedFileContent);
  }, []);

  /**
   * Gère le changement de fichier via l'input de type 'file'.
   * Lit le contenu du fichier et le passe à processFileContent.
   * @param {Event} event L'événement de changement de fichier.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          processFileContent(e.target.result);
        } catch (err) {
          console.error("Erreur lors de la lecture du fichier:", err);
          setError("Erreur lors de la lecture du fichier. Veuillez vous assurer que c'est un fichier texte valide.");
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Impossible de lire le fichier.");
        setLoading(false);
      };
      reader.readAsText(file);
    } else {
      setFileName("Aucun fichier sélectionné");
    }
  };

  /**
   * Traite le contenu du fichier pour extraire les heures de cours et l'emploi du temps détaillé par professeur, classe et local.
   * Les lignes sans sigle de professeur valide sont attribuées à 'INCONNU'.
   * Les heures des professeurs sont comptées par slot unique (numéro de cours, jour, heure).
   * @param {string} content Le contenu textuel du fichier.
   */
  const processFileContent = (content) => {
    setLoading(true);
    setError(null);
    const uniqueProfessorSlots = {}; // { 'PROF': Set('courseNum-day-hour') } - pour le total des heures

    // Structures temporaires pour collecter les entrées brutes avant regroupement
    const professorRawEntries = {}; // { 'PROF': [entry, ...] }
    const classRawEntries = {};     // { 'CLASS': [entry, ...] }
    const roomRawEntries = {};      // { 'ROOM': [entry, ...] }

    try {
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.trim() === '') {
          return;
        }

        const parts = line.split(',');

        if (parts.length < 7) {
          // Gérer les lignes mal formées en les attribuant à 'INCONNU'
          const defaultEntry = {
            courseNumber: 'N/A',
            class: 'N/A',
            professorName: UNKNOWN_PROFESSOR_KEY,
            course: 'N/A',
            room: 'N/A',
            day: '0',
            hour: '0'
          };

          // Ajouter aux entrées brutes pour le professeur INCONNU
          if (!professorRawEntries[UNKNOWN_PROFESSOR_KEY]) professorRawEntries[UNKNOWN_PROFESSOR_KEY] = [];
          professorRawEntries[UNKNOWN_PROFESSOR_KEY].push(defaultEntry);

          // Ajouter aux slots uniques pour le comptage des heures du professeur INCONNU
          if (!uniqueProfessorSlots[UNKNOWN_PROFESSOR_KEY]) {
            uniqueProfessorSlots[UNKNOWN_PROFESSOR_KEY] = new Set();
          }
          // Pour les lignes mal formées, l'identifiant de slot doit être unique pour ne pas les fusionner
          uniqueProfessorSlots[UNKNOWN_PROFESSOR_KEY].add(`N/A-0-0-${Date.now()}-${Math.random()}`);

          console.warn(`Ligne mal formée ou incomplète (moins de 7 champs) : "${line}". Attribuée à INCONNU.`);
          return;
        }

        const courseNumber = (parts[0] || '').replace(/"/g, '').trim() || 'N/A';
        const className = (parts[1] || '').replace(/"/g, '').trim() || 'N/A';
        let professorName = (parts[2] || '').replace(/"/g, '').trim();
        const courseName = (parts[3] || '').replace(/"/g, '').trim() || 'N/A';
        const roomName = (parts[4] || '').replace(/"/g, '').trim() || 'N/A';
        const day = (parts[5] || '').trim();
        const hour = (parts[6] || '').trim();

        if (!professorName || professorName.length !== 3 || !/^[A-Z]{3}$/.test(professorName)) {
          console.warn(`Sigle de professeur invalide ou manquant : "${professorName}" dans la ligne "${line}". Attribué à INCONNU.`);
          professorName = UNKNOWN_PROFESSOR_KEY;
        }

        const entry = {
          courseNumber: courseNumber,
          class: className,
          professorName: professorName,
          course: courseName,
          room: roomName,
          day: day,
          hour: hour
        };

        // Collecter les entrées brutes pour chaque type d'entité
        if (!professorRawEntries[professorName]) professorRawEntries[professorName] = [];
        professorRawEntries[professorName].push(entry);

        if (className !== 'N/A') {
          if (!classRawEntries[className]) classRawEntries[className] = [];
          classRawEntries[className].push(entry);
        }

        if (roomName !== 'N/A') {
          if (!roomRawEntries[roomName]) roomRawEntries[roomName] = [];
          roomRawEntries[roomName].push(entry);
        }

        // Mettre à jour les slots uniques pour le total des heures des professeurs
        if (!uniqueProfessorSlots[professorName]) {
          uniqueProfessorSlots[professorName] = new Set();
        }
        uniqueProfessorSlots[professorName].add(`${courseNumber}-${day}-${hour}`);
      });

      // --- Traitement des données brutes pour créer les emplois du temps regroupés ---
      const finalAllSchedules = {
        professors: {},
        classes: {},
        rooms: {}
      };

      // 1. Regroupement pour les professeurs (par numéro de cours, jour, heure)
      for (const prof in professorRawEntries) {
        const groupedSlots = {}; // Key: 'courseNum-day-hour'
        professorRawEntries[prof].forEach(entry => {
          const slotKey = `${entry.courseNumber}-${entry.day}-${entry.hour}`;
          if (!groupedSlots[slotKey]) {
            groupedSlots[slotKey] = {
              courseNumber: entry.courseNumber,
              day: entry.day,
              hour: entry.hour,
              course: entry.course,
              room: entry.room,
              classes: new Set(),
              professorName: entry.professorName
            };
          }
          groupedSlots[slotKey].classes.add(entry.class);
        });
        finalAllSchedules.professors[prof] = Object.values(groupedSlots).map(groupedEntry => ({
          courseNumber: groupedEntry.courseNumber, // Garder pour la logique, même si non affiché
          day: groupedEntry.day,
          hour: groupedEntry.hour,
          course: groupedEntry.course,
          room: groupedEntry.room,
          class: Array.from(groupedEntry.classes).sort().join(', '),
          professorName: groupedEntry.professorName
        }));
      }

      // 2. Regroupement pour les classes (par jour, heure)
      for (const cls in classRawEntries) {
        const groupedSlots = {}; // Key: 'day-hour'
        classRawEntries[cls].forEach(entry => {
          const slotKey = `${entry.day}-${entry.hour}`;
          if (!groupedSlots[slotKey]) {
            groupedSlots[slotKey] = {
              day: entry.day,
              hour: entry.hour,
              class: entry.class,
              professorNames: new Set(),
              courses: new Set(),
              rooms: new Set()
            };
          }
          groupedSlots[slotKey].professorNames.add(entry.professorName);
          groupedSlots[slotKey].courses.add(entry.course);
          groupedSlots[slotKey].rooms.add(entry.room);
        });
        finalAllSchedules.classes[cls] = Object.values(groupedSlots).map(groupedEntry => ({
          day: groupedEntry.day,
          hour: groupedEntry.hour,
          class: groupedEntry.class,
          professorName: Array.from(groupedEntry.professorNames).sort().join(', '),
          course: Array.from(groupedEntry.courses).sort().join(', '),
          room: Array.from(groupedEntry.rooms).sort().join(', ')
        }));
      }

      // 3. Regroupement pour les locaux (par jour, heure)
      for (const room in roomRawEntries) {
        const groupedSlots = {}; // Key: 'day-hour'
        roomRawEntries[room].forEach(entry => {
          const slotKey = `${entry.day}-${entry.hour}`;
          if (!groupedSlots[slotKey]) {
            groupedSlots[slotKey] = {
              day: entry.day,
              hour: entry.hour,
              room: entry.room,
              classes: new Set(),
              professorNames: new Set(),
              courses: new Set()
            };
          }
          groupedSlots[slotKey].classes.add(entry.class);
          groupedSlots[slotKey].professorNames.add(entry.professorName);
          groupedSlots[slotKey].courses.add(entry.course);
        });
        finalAllSchedules.rooms[room] = Object.values(groupedSlots).map(groupedEntry => ({
          day: groupedEntry.day,
          hour: groupedEntry.hour,
          room: groupedEntry.room,
          class: Array.from(groupedEntry.classes).sort().join(', '),
          professorName: Array.from(groupedEntry.professorNames).sort().join(', '),
          course: Array.from(groupedEntry.courses).sort().join(', ')
        }));
      }

      // Calculer le total des heures pour chaque professeur à partir des slots uniques
      const finalProfessorHoursMap = {};
      for (const prof in uniqueProfessorSlots) {
        finalProfessorHoursMap[prof] = uniqueProfessorSlots[prof].size;
      }

      setProfessorHours(finalProfessorHoursMap);
      setAllSchedules(finalAllSchedules);
    } catch (err) {
      console.error("Erreur lors du traitement du fichier:", err);
      setError("Erreur lors du traitement du fichier. Veuillez vérifier le format.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir la modale avec l'emploi du temps de l'entité sélectionnée
  const openScheduleModal = (name, type) => {
    setSelectedEntity({ name, type });
    setIsModalOpen(true);
  };

  // Fonction pour fermer la modale
  const closeScheduleModal = () => {
    setIsModalOpen(false);
    setSelectedEntity(null);
  };

  // Préparer les données pour l'affichage dans les tableaux
  const getSortedData = (type) => {
    let dataArray = [];
    let hoursMap = {};

    if (type === 'professors') {
      hoursMap = professorHours;
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      // Trier 'INCONNU' en dernier, le reste par ordre alphabétique
      dataArray.sort((a, b) => {
        if (a.name === UNKNOWN_PROFESSOR_KEY) return 1;
        if (b.name === UNKNOWN_PROFESSOR_KEY) return -1;
        return a.name.localeCompare(b.name); // Tri alphabétique par nom
      });
    } else if (type === 'classes') {
      hoursMap = {};
      // Le total des heures pour les classes est le nombre d'entrées regroupées
      for (const className in allSchedules.classes) {
        hoursMap[className] = allSchedules.classes[className].length;
      }
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      dataArray.sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique par nom
    } else if (type === 'rooms') {
      hoursMap = {};
      // Le total des heures pour les locaux est le nombre d'entrées regroupées
      for (const roomName in allSchedules.rooms) {
        hoursMap[roomName] = allSchedules.rooms[roomName].length;
      }
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      dataArray.sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique par nom
    }
    return dataArray;
  };

  const currentData = getSortedData(activeTab);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Gestion des Horaires
        </h1>

        {/* Section de téléchargement de fichier */}
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg flex flex-col items-center">
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md">
            Choisir un fichier Untis (.TXT)
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="mt-3 text-gray-700 text-sm">{fileName}</span>
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>


        {/* Onglets de navigation */}
        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            className={`py-2 px-4 text-lg font-medium ${
              activeTab === 'professors'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            } focus:outline-none transition duration-150 ease-in-out`}
            onClick={() => setActiveTab('professors')}
          >
            Professeurs
          </button>
          <button
            className={`ml-4 py-2 px-4 text-lg font-medium ${
              activeTab === 'classes'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            } focus:outline-none transition duration-150 ease-in-out`}
            onClick={() => setActiveTab('classes')}
          >
            Classes
          </button>
          <button
            className={`ml-4 py-2 px-4 text-lg font-medium ${
              activeTab === 'rooms'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            } focus:outline-none transition duration-150 ease-in-out`}
            onClick={() => setActiveTab('rooms')}
          >
            Locaux
          </button>
        </div>

        {loading ? (
          <p className="text-center text-blue-600">Chargement et traitement du fichier...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                    {activeTab === 'professors' && 'Nom du Professeur'}
                    {activeTab === 'classes' && 'Nom de la Classe'}
                    {activeTab === 'rooms' && 'Nom du Local'}
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                    Total des Heures
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr
                      key={item.name}
                      className={`cursor-pointer hover:bg-blue-100 transition duration-150 ease-in-out ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => openScheduleModal(item.name, activeTab)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">
                        {item.hours}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-4 text-center text-gray-500">
                      Aucune donnée trouvée pour cette catégorie.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-2">Note sur le traitement du fichier :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Cette application analyse chaque ligne du fichier comme un créneau de cours.
            </li>
            <li>
              Pour les **professeurs**, le "Total des Heures" représente le nombre de créneaux horaires uniques (définis par le numéro de cours, le jour et l'heure). Si un professeur enseigne le même cours au même moment à plusieurs classes, ces classes sont **regroupées** sur une seule ligne dans l'emploi du temps détaillé du professeur.
            </li>
            <li>
              Pour les **classes**, le "Total des Heures" représente le nombre de créneaux horaires uniques (définis par le jour et l'heure). Si plusieurs cours sont donnés simultanément pour une même classe, les informations de professeur, de cours et de local sont **regroupées** sur une seule ligne.
            </li>
            <li>
              Pour les **locaux**, le "Total des Heures" représente le nombre de créneaux horaires uniques (définis par le jour et l'heure). Si un local est utilisé par plusieurs classes ou professeurs pour différents cours au même moment, ces informations sont **regroupées** sur une seule ligne.
            </li>
            <li>
              Si le sigle du professeur est manquant ou ne respecte pas le format de 3 lettres majuscules, l'heure est attribuée à un professeur "INCONNU".
            </li>
            <li>
              Les champs manquants (classe, cours, local, jour, heure) sont affichés comme "N/A" (Non Applicable) dans l'emploi du temps détaillé.
            </li>
            <li>
              Toutes les listes sont triées par ordre alphabétique du nom de l'entité. Le professeur "INCONNU" est toujours affiché en dernier.
            </li>
          </ul>
          <p className="mt-2">
            Cliquez sur le nom d'une entité (professeur, classe ou local) dans le tableau pour afficher son emploi du temps détaillé.
          </p>
        </div>
      </div>

      {/* Modale de l'emploi du temps */}
      {isModalOpen && selectedEntity && (
        <ScheduleModal
          entityName={selectedEntity.name}
          scheduleType={selectedEntity.type}
          scheduleData={allSchedules[selectedEntity.type][selectedEntity.name] || []}
          onClose={closeScheduleModal}
        />
      )}
    </div>
  );
}

export default App;
