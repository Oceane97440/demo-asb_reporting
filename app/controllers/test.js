
                    if (firstLinkTaskId || twoLinkTaskId) {
                        var taskId = firstLinkTaskId;
                        var taskId_uu = twoLinkTaskId;

                        console.log('taskId', taskId);
                        console.log("taskId_uu", taskId_uu);

                        let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;
                        let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;

                        // 2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min on
                        // commence à 10sec
                        var time = 10000;
                        let timerFile = setInterval(async () => {
                            // DATA STORAGE - TASK 1 et 2
                            var dataLSTaskGlobal = localStorageTasks.getItem(
                                'campaignID-' + campaignid + '-taskGlobal'
                            );

                            var dataLSTaskGlobalVU = localStorageTasks.getItem(
                                'campaignID-' + campaignid + '-taskGlobalVU'
                            );

                            if (!dataLSTaskGlobal || !dataLSTaskGlobalVU) {

                                if (!dataLSTaskGlobal) {
                                    time += 5000;
                                    let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');
                                    if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                                        // 3) Récupère la date de chaque requête
                                        let dataLSTaskGlobal = localStorageTasks.getItem(
                                            'campaignID-' + campaignid + '-taskGlobal'
                                        );
                                        if (!dataLSTaskGlobal) {
                                            dataFile = await AxiosFunction.getReportingData(
                                                'GET',
                                                `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`,
                                                ''
                                            );
                                            // save la data requête 1 dans le local storage
                                            dataLSTaskGlobal = {
                                                'datafile': dataFile.data
                                            };
                                            localStorageTasks.setItem(
                                                'campaignID-' + campaignid + '-taskGlobal',
                                                JSON.stringify(dataLSTaskGlobal)
                                            );
                                            console.log('Creation de dataLSTaskGlobal');
                                        }
                                    }
                                }

                                // Request task2
                                if (!dataLSTaskGlobalVU) {
                                    time += 5000;
                                    let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');
                                    if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {

                                        // 3) Récupère la date de chaque requête
                                        dataLSTaskGlobalVU = localStorageTasks.getItem(
                                            'campaignID-' + campaignid + '-taskGlobalVU'
                                        );
                                        if (!dataLSTaskGlobalVU) {
                                            dataFile2 = await AxiosFunction.getReportingData(
                                                'GET',
                                                `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}/file`,
                                                ''
                                            );
                                            // save la data requête 2 dans le local storage
                                            dataLSTaskGlobalVU = {
                                                'datafile': dataFile2.data
                                            };
                                            localStorageTasks.setItem(
                                                'campaignID-' + campaignid + '-taskGlobalVU',
                                                JSON.stringify(dataLSTaskGlobalVU)
                                            );
                                            console.log('Creation de dataLSTaskGlobalVU');
                                        }
                                    }
                                }

                                if (dataLSTaskGlobal && dataLSTaskGlobalVU) {
                                    //  clearInterval(timerFile);
                                    console.log('Creation de clearInterval(timerFile)');
                                }

                            } else {
                                

                                




                                localStorage.setItem('campaignID-' + campaignid, JSON.stringify(testObject));
                                res.json('Load Storage :', 'campaignId-' + campaignid);
                            }

                        }, time);
                    }