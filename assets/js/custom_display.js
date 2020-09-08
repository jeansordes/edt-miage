// Edit your ics sources here

const all_ics_sources = [
    // { url: 'ut3.ics?v=' + Date.now(), source: "https://www.raphaelbuquet.com/tools/edt/", title: 'EDT Paul Sabatier', event_properties: { color: 'red' } },
    { url: 'ut1_fi.ics?v=' + Date.now(), source: "https://ade-production.ut-capitole.fr/direct/index.jsp?showTree=false&days=0,1,2,3,4,5&login=visu&password=visu&locale=fr&projectId=17&resources=2273", title: 'EDT Capitole Formation Initiale', event_properties: { color: 'DodgerBlue' } },
    { url: 'ut1_fa.ics?v=' + Date.now(), source: "https://ade-production.ut-capitole.fr/direct/index.jsp?showTree=false&days=0,1,2,3,4,5&login=visu&password=visu&locale=fr&projectId=17&resources=3674", title: 'EDT Capitole Alternants', event_properties: { color: 'orange' } },
]

////////////////////////////////////////////////////////////////////////////
//
// Here be dragons!
//
////////////////////////////////////////////////////////////////////////////

const data_req = (url, callback) => {
    req = new XMLHttpRequest()
    req.addEventListener('load', callback)
    req.open('GET', url)
    req.send()
}

const add_recur_events = () => {
    if (sources_to_load_cnt < 1) {
        $('#calendar').fullCalendar('addEventSource', expand_recur_events)
    } else {
        setTimeout(add_recur_events, 30)
    }
}


$(document).ready(function () {
    // display events
    const refresh = () => {
        const load_ics = (ics, cpt) => {
            data_req(ics.url, function () {
                $('#calendar').fullCalendar('addEventSource', fc_events(this.response, ics.event_properties))
                sources_to_load_cnt -= 1;
            })
            // Meddling with the HTML to add everything related to our ics feeds dynamically
            // hidden ics feeds
            document.getElementById("ics-feeds").insertAdjacentHTML('beforeend', "<span hidden id='ics-url" + cpt + "'>" + ics.url + "</span>");
        
            // calendar legend
            let cleanUrl = ics.url.split('?v=')[0];
            let showBackButton = all_ics_sources.length != ics_sources.length;
            document.getElementById("legend-feeds").insertAdjacentHTML('beforeend',
            `<div class='calendar-feed'>
                ${showBackButton ? `<a href='/'>Afficher tous les calendriers</a>` : ''}

                <div class="mt-1">
                    <span class='fc-event-dot' style='background-color: ${ics.event_properties['color']}'></span>
                    ${ics.title}
                    ${showBackButton ? '' : `<button class="block mt-1" id='href-${cpt}'>Afficher ce calendrier uniquement</button>`}
                    <div class="mt-1">Url du fichier</div>
                    <div class="mt-1">
                        <input id="input${cpt}" value="${window.location.origin + '/' + cleanUrl}" size="15
                        "/>
                        <button id='copyLink${cpt}'>
                            <img src='./img/clipboard.svg' alt='copy to clipboard' title='copy to clipboard' width='15px' style='padding-top: 3px;'/>
                            <span id="tooltip${cpt}">Copier</span>
                        </button>
                    </div>
                    <a href="${ics.source}" target="_blank">Ressource d'origine</a>
                </div>
            </div>`);

            document.querySelector('#href-' + cpt).addEventListener('click', () => {
                window.location.hash = '#' + (cpt - 1);
                window.location.reload();
            });

            if (all_ics_sources.length != ics_sources.length) {
                document.getElementById("legend-feeds").insertAdjacentHTML('beforeend', "");
            }
        
            // copy button for ics feeds
            document.querySelector("#copyLink" + cpt).addEventListener("click", evt => {
                let input = document.querySelector("#input" + cpt);
                input.select();
                input.setSelectionRange(0,99999);
                document.execCommand("copy");
                document.querySelector("#tooltip" + cpt).innerHTML = "URL copié !";
            });
        }

        // change les fichiers affichés en fonction du clic
        const _url = window.location.href.split('#')[1];
        if (_url && !isNaN(_url) && parseInt(_url) >= 0 && parseInt(_url) < all_ics_sources.length) {
            ics_sources = [all_ics_sources[parseInt(_url)]];
        } else {
            ics_sources = [...all_ics_sources];
        }

        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay,listAllYears'
            },
            defaultView: 'agendaWeek',
            firstDay: '1',
            locale: 'fr',
            lang: 'fr',
            views: {
                listAllYears: {
                    buttonText: 'Voir tout',
                    type: 'listYear',
                    duration: { years: 2 },
                },
            },
            navLinks: true,
            editable: false,
            eventLimit: true, // allow "more" link when too many events
            eventRender: function (event, element, view) {
                if (view.name == "listMonth" || view.name == "listWeek") {
                    element.find('.fc-list-item-title').append('<div style="margin-top:5px;"></div><span style="font-size: 0.9em">' + (event.description || 'no description') + '</span>' + ((event.loc) ? ('<span style="margin-top:5px;display: block"><b>Lieu: </b>' + event.loc + '</span>') : ' ') + '</div>');
                } else if (view.name == "agendaWeek" || view.name == "agendaDay") {
                    element.qtip({
                        content: {
                            text: '<small>' + ((event.start.format("d") != event.end.format("d")) ? (event.start.format("MMM Do")
                                + (((event.end.subtract(1, "seconds")).format("d") == event.start.format("d")) ? ' ' : ' - '
                                    + (event.end.subtract(1, "seconds")).format("MMM Do"))) : (event.start.format("HH:mm")
                                        + ' - ' + event.end.format("HH:mm"))) + '</small><br/>' +
                                '<b>' + event.title + '</b>' +
                                ((event.description) ? ('<br/>' + event.description) : ' ') +
                                ((event.loc) ? ('<br/><b>Lieu: </b>' + event.loc) : ' ')
                        },
                        style: {
                            classes: 'qtip-bootstrap qtip-rounded qtip-shadown qtip-light',
                        },
                        position: {
                            my: 'center left',
                            at: 'center right',
                        }
                    });
                } else {
                    element.qtip({
                        content: {
                            text: '<small>' + ((event.start.format("d") != event.end.format("d")) ? (event.start.format("MMM Do")
                                + (((event.end.subtract(1, "seconds")).format("d") == event.start.format("d")) ? ' ' : ' - '
                                    + (event.end.subtract(1, "seconds")).format("MMM Do"))) : (event.start.format("HH:mm")
                                        + ' - ' + event.end.format("HH:mm"))) + '</small><br/>' +
                                '<b>' + event.title + '</b>' +
                                ((event.description) ? ('<br/>' + event.description) : ' ') +
                                ((event.loc) ? ('<br/><b>Lieu: </b>' + event.loc) : ' ')
                        },
                        style: {
                            classes: 'qtip-bootstrap qtip-rounded qtip-shadown qtip-light',
                        },
                        position: {
                            my: 'top left',
                            at: 'bottom center',
                        }
                    });
                }
            }
        })
        sources_to_load_cnt = ics_sources.length
        var cpt = 0;
        for (ics of ics_sources) {
            cpt += 1;
            load_ics(ics, cpt)
        }
        add_recur_events()
    };
    refresh();
})

