// Edit your ics sources here
const all_ics_sources = [
    // { url: 'ut3.ics', title: 'EDT Paul Sabatier', event_properties: { color: 'SeaGreen' } },
    { url: 'ut1_fa.ics', title: 'EDT Capitole Alternants', event_properties: { color: 'DodgerBlue' } },
    { url: 'ut1_fi.ics', title: 'EDT Capitole Formation Initiale', event_properties: { color: 'red' } },
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
            document.getElementById("legend-feeds").insertAdjacentHTML('beforeend', "    <div class='calendar-feed'>" +
                "<span class='fc-event-dot' style='background-color: " + ics.event_properties['color'] + "'></span>" +
                "<span> <button id='href-" + cpt + "'>" + ics.title + "</button>"
                // + "<button id='copyLink" + cpt + "'>" + "<img src='./img/clipboard.svg' "
                // + "alt='copy to clipboard' title='copy to clipboard' width='15px' style='padding-top: 3px;'/></button>"
                + "</span></div>");
            document.getElementById('href-' + cpt).addEventListener('click', () => {
                window.location.hash = '#' + (cpt - 1);
                window.location.reload();
            });

            if (all_ics_sources.length != ics_sources.length) {
                document.getElementById("legend-feeds").insertAdjacentHTML('beforeend', "<br><div class='calendar-feed'><a href='/'>Afficher tous les calendriers</a></div>");
            }
        
            // copy button for ics feeds
            // document.querySelector("#copyLink" + cpt).addEventListener("click", function () { copy("ics-url" + cpt); });
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
            defaultView: 'listAllYears',
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
                    element.find('.fc-list-item-title').append('<div style="margin-top:5px;"></div><span style="font-size: 0.9em">' + (event.description || 'no description') + '</span>' + ((event.loc) ? ('<span style="margin-top:5px;display: block"><b>Venue: </b>' + event.loc + '</span>') : ' ') + '</div>');
                } else if (view.name == "agendaWeek" || view.name == "agendaDay") {
                    element.qtip({
                        content: {
                            text: '<small>' + ((event.start.format("d") != event.end.format("d")) ? (event.start.format("MMM Do")
                                + (((event.end.subtract(1, "seconds")).format("d") == event.start.format("d")) ? ' ' : ' - '
                                    + (event.end.subtract(1, "seconds")).format("MMM Do"))) : (event.start.format("HH:mm")
                                        + ' - ' + event.end.format("HH:mm"))) + '</small><br/>' +
                                '<b>' + event.title + '</b>' +
                                ((event.description) ? ('<br/>' + event.description) : ' ') +
                                ((event.loc) ? ('<br/><b>Venue: </b>' + event.loc) : ' ')
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
                                ((event.loc) ? ('<br/><b>Venue: </b>' + event.loc) : ' ')
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

