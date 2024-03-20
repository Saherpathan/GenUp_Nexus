import React from 'react';
import * as d3 from "d3";   

const Builder = ({json}) => {

//   const chartBuilder = (jsondata) => {
//     // d3.select('#chart svg').remove();

//     let mouseX = 0;
//     let buttonTracker = [];
//     let rootNode = d3.hierarchy(jsondata, d => d.children);
//     var pathLinks = rootNode.links();
//     var updatePathLinks;

//     var circleLinks = rootNode.descendants();
//     var updateCircleLinks;

//     var textLinks = rootNode.descendants();
//     var updateTextLinks;


//     let dim = {
//         'width': window.screen.width,
//         'height': window.screen.height,
//         'margin': 25,
//     };

//     let svg = d3.select(ref.current)
//         .append('svg')
//         .style('background', 'white')
//         .attr('width', window.screen.width)
//         .attr('height', window.screen.height)
//         .attr('margin', 25)
        

//     document.querySelector("#chart").classList.add("center");
//     svg = d3.select(document.querySelector("svg"));
//     console.log(svg);
//     try {
//         var g = svg.append('g')
//         .attr('transform', 'translate(140,50)');
//     }
//     catch(error) {
//         console.log(error);
//     }
//     let layout = d3.tree().size([dim.height - 50, dim.width - 320]);
//     layout(rootNode);

//     let lines = g.selectAll('path');

//     function update(data) {
//         let group = g.selectAll('path')
//             .data(data, (d, i) => d.target.data.name)
//             .join(
//                 function(enter) {
//                     return enter.append('path')
//                         .attr({
//                             'd': d3.linkHorizontal()
//                                 .x(d => mouseX)
//                                 .y(d => d.x),
//                             'fill': 'none',
//                             'stroke': 'black'
//                         })
//                 },
//                 function(update) {
//                     return update;
//                 },
//                 function(exit) {
//                     return exit.call(path => path.transition().duration(300).remove()
//                         .attr('d', d3.linkHorizontal()
//                             .x(d => mouseX)
//                             .y(d => d.x)));
//                 }
//             )
//             .call(path => path.transition().duration(1000).attr('d', d3.linkHorizontal()
//                     .x(d => d.y)
//                     .y(d => d.x))
//                 .attr("id", function(d, i) {
//                     return "path" + i
//                 })
//             );
//         console.log("M6");
//     }
//     update(pathLinks);

//     function updateCircles(data) {
//         console.log("M7");
//         g.selectAll('circle')
//             .data(data, (d) => d.data.name)
//             .join(
//                 function(enter) {
//                     return enter.append('circle')
//                         .attr({
//                             'cx': (d) => mouseX,
//                             'cy': (d) => d.x,
//                             'r': 12,
//                             'fill': (d) => {
//                                 if (d.children === undefined) {
//                                     return 'red'
//                                 }
//                                 return 'green'
//                             },
//                             'id': (d, i) => d.data.name,
//                             'class': 'sel'
//                         })
//                 },
//                 function(update) {
//                     return update;
//                 },
//                 function(exit) {
//                     return exit.call(path => path.transition().duration(300).remove()
//                         .attr({
//                             'cx': (d) => mouseX,
//                             'r': (d) => 0
//                         }));
//                 }
//             )
//             .call(circle => circle.transition().duration(1000).attr('cx', (d) => d.y))

//             .on('mouseover', function(d) {

//                 d3.select(this)
//                     .attr({
//                         'fill': 'orange',

//                     })
//                     .transition().duration(100).attr('r', 16);
//             })
//             .on('mouseout', function(d) {
//                 d3.select(this)
//                     .attr('fill', (d) => {
//                         if (d.children === undefined) {
//                             return 'red'
//                         }
//                         return 'green'
//                     })
//                     .transition().duration(100).attr('r', 12)

//             })
//             .on('click', async function(d) {

//                 let buttonId = d3.select(this)["_groups"][0][0]["attributes"].id.value;
//                 mouseX = d3.select(this)["_groups"][0][0]["attributes"].cx.value;
//                 //check to see if button already exists aka has been clicked
//                 //if it does, we need to send that data to update function
//                 //and remove that object

//                 let checkButtonExists = buttonTracker.filter(button => button.buttonId === buttonId);

//                 if (checkButtonExists[0] !== undefined) {
//                     //also remove this item from button tracker
//                     buttonTracker = buttonTracker.filter(button => button.buttonId !== buttonId);

//                     //handle path update
//                     pathLinks = checkButtonExists[0].buttonPathData.concat(pathLinks);

//                     update(pathLinks);


//                     //handle  circle update
//                     circleLinks = checkButtonExists[0].buttonCircleData.concat(circleLinks);
//                     updateCircles(circleLinks);

//                     //handle text update

//                     textLinks = checkButtonExists[0].buttonTextData.concat(textLinks);
//                     updateText(textLinks);

//                     return;

//                 }

//                 var valueArray = await processedlinks(d.links());

//                 updatePathLinks = pathLinks.filter(function(item) {
//                     return !valueArray.includes(item.target.data.name);
//                 });

//                 //now run the filter to get unfiltered items
//                 var clickedPathData = pathLinks.filter(function(item) {
//                     return valueArray.includes(item.target.data.name);
//                 });


//                 updateCircleLinks = circleLinks.filter(function(item) {
//                     return !valueArray.includes(item.data.name);
//                 });

//                 var clickedCircleData = circleLinks.filter(function(item) {
//                     return valueArray.includes(item.data.name);
//                 });


//                 updateTextLinks = textLinks.filter(function(item) {
//                     return !valueArray.includes(item.data.name);
//                 });

//                 var clickedTextData = textLinks.filter(function(item) {
//                     return valueArray.includes(item.data.name);
//                 });

//                 //now we push the circleData to an array
//                 buttonTracker.push({
//                     buttonId: buttonId,
//                     buttonPathData: clickedPathData,
//                     buttonCircleData: clickedCircleData,
//                     buttonTextData: clickedTextData
//                 })


//                 update(updatePathLinks);
//                 updateCircles(updateCircleLinks);
//                 updateText(updateTextLinks);
//                 async function processedlinks(dlinks) {
//                     var valueArray = [];

//                     return new Promise((resolve, reject) => {
//                         dlinks.forEach(async (element) => {
//                             valueArray.push(element.target.data.name);
//                         });
//                         resolve(valueArray);
//                     });
//                 }

//                 pathLinks = updatePathLinks;
//                 circleLinks = updateCircleLinks;
//                 textLinks = updateTextLinks;

//             });
//         console.log("M8");
//     }
//     updateCircles(rootNode.descendants());

//     function updateText(data) {
//         console.log("M9");
//         g.selectAll('text')
//             .data(data, (d) => d.data.name)
//             .join(
//                 function(enter) {
//                     return enter.append('text')
//                         .attr({
//                             'x': (d) => mouseX,
//                             'y': (d) => d.x,
//                             'font-size': 0
//                         })
//                         .text((d) => d.data.name);
//                 },
//                 function(update) {
//                     return update;
//                 },
//                 function(exit) {
//                     return exit.call(text => text.transition().duration(300).remove().attr({
//                         'x': (d) => mouseX,
//                         'font-size': 0
//                     }));
//                 }

//             )
//             .call(text => text.transition().duration(1000).attr({
//                 'x': (d) => d.y + 20,
//                 'font-size': 15,
//                 'fill': 'black',
//             }));
//         console.log("M10");
//     }
//     updateText(textLinks);
//   };


    const chartBuilder = (jsondata) => {
        let mouseX = 0;
        let buttonTracker = [];
        let rootNode = d3.hierarchy(jsondata, d => d.children);
        var pathLinks = rootNode.links();
        var updatePathLinks;

        var circleLinks = rootNode.descendants();
        var updateCircleLinks;

        var textLinks = rootNode.descendants();
        var updateTextLinks;


        let dim = {
            'width': window.screen.width,
            'height': window.screen.height,
            'margin': 25,
        };

        let svg = d3.select('#chart').append('svg')
            .style('background', 'white')
            .attr(dim);

        document.querySelector("#chart").classList.add("center");

        let g = svg.append('g')
            .attr('transform', 'translate(140,50)');

        let layout = d3.tree().size([dim.height - 50, dim.width - 320]);
        layout(rootNode);

        let lines = g.selectAll('path');

        function update(data) {
            let group = g.selectAll('path')
                .data(data, (d, i) => d.target.data.name)
                .join(
                    function(enter) {
                        return enter.append('path')
                            .attr({
                                'd': d3.linkHorizontal()
                                    .x(d => mouseX)
                                    .y(d => d.x),
                                'fill': 'none',
                                'stroke': 'black'
                            })
                    },
                    function(update) {
                        return update;
                    },
                    function(exit) {
                        return exit.call(path => path.transition().duration(300).remove()
                            .attr('d', d3.linkHorizontal()
                                .x(d => mouseX)
                                .y(d => d.x)));
                    }


                )
                .call(path => path.transition().duration(1000).attr('d', d3.linkHorizontal()
                        .x(d => d.y)
                        .y(d => d.x))
                    .attr("id", function(d, i) {
                        return "path" + i
                    }));
        }
        update(pathLinks);

        function updateCircles(data) {
            g.selectAll('circle')
                .data(data, (d) => d.data.name)
                .join(
                    function(enter) {
                        return enter.append('circle')
                            .attr({
                                'cx': (d) => mouseX,
                                'cy': (d) => d.x,
                                'r': 12,
                                'fill': (d) => {
                                    if (d.children == undefined) {
                                        return 'red'
                                    }
                                    return 'green'
                                },
                                'id': (d, i) => d.data.name,
                                'class': 'sel'
                            })
                    },
                    function(update) {
                        return update;
                    },
                    function(exit) {
                        return exit.call(path => path.transition().duration(300).remove()
                            .attr({
                                'cx': (d) => mouseX,
                                'r': (d) => 0
                            }));
                    }
                )
                .call(circle => circle.transition().duration(1000).attr('cx', (d) => d.y))

                .on('mouseover', function(d) {

                    d3.select(this)
                        .attr({
                            'fill': 'orange',

                        })
                        .transition().duration(100).attr('r', 16);
                })
                .on('mouseout', function(d) {
                    d3.select(this)
                        .attr('fill', (d) => {
                            if (d.children == undefined) {
                                return 'red'
                            }
                            return 'green'
                        })
                        .transition().duration(100).attr('r', 12)

                })
                .on('click', async function(d) {

                    let buttonId = d3.select(this)["_groups"][0][0]["attributes"].id.value;
                    mouseX = d3.select(this)["_groups"][0][0]["attributes"].cx.value;
                    //check to see if button already exists aka has been clicked
                    //if it does, we need to send that data to update function
                    //and remove that object

                    let checkButtonExists = buttonTracker.filter(button => button.buttonId == buttonId);

                    if (checkButtonExists[0] != undefined) {
                        //also remove this item from button tracker
                        buttonTracker = buttonTracker.filter(button => button.buttonId != buttonId);

                        //handle path update
                        pathLinks = checkButtonExists[0].buttonPathData.concat(pathLinks);

                        update(pathLinks);


                        //handle  circle update
                        circleLinks = checkButtonExists[0].buttonCircleData.concat(circleLinks);
                        updateCircles(circleLinks);

                        //handle text update

                        textLinks = checkButtonExists[0].buttonTextData.concat(textLinks);
                        updateText(textLinks);

                        return;

                    }

                    var valueArray = await processedlinks(d.links());

                    updatePathLinks = pathLinks.filter(function(item) {
                        return !valueArray.includes(item.target.data.name);
                    });

                    //now run the filter to get unfiltered items
                    var clickedPathData = pathLinks.filter(function(item) {
                        return valueArray.includes(item.target.data.name);
                    });


                    updateCircleLinks = circleLinks.filter(function(item) {
                        return !valueArray.includes(item.data.name);
                    });

                    var clickedCircleData = circleLinks.filter(function(item) {
                        return valueArray.includes(item.data.name);
                    });


                    updateTextLinks = textLinks.filter(function(item) {
                        return !valueArray.includes(item.data.name);
                    });

                    var clickedTextData = textLinks.filter(function(item) {
                        return valueArray.includes(item.data.name);
                    });

                    //now we push the circleData to an array
                    buttonTracker.push({
                        buttonId: buttonId,
                        buttonPathData: clickedPathData,
                        buttonCircleData: clickedCircleData,
                        buttonTextData: clickedTextData
                    })


                    update(updatePathLinks);
                    updateCircles(updateCircleLinks);
                    updateText(updateTextLinks);
                    async function processedlinks(dlinks) {
                        var valueArray = [];

                        return new Promise((resolve, reject) => {
                            dlinks.forEach(async (element) => {
                                valueArray.push(element.target.data.name);
                            });
                            resolve(valueArray);
                        });
                    }

                    pathLinks = updatePathLinks;
                    circleLinks = updateCircleLinks;
                    textLinks = updateTextLinks;

                });


        }
        updateCircles(rootNode.descendants());

        function updateText(data) {

            g.selectAll('text')
                .data(data, (d) => d.data.name)
                .join(
                    function(enter) {
                        return enter.append('text')
                            .attr({
                                'x': (d) => mouseX,
                                'y': (d) => d.x,
                                'font-size': 0
                            })
                            .text((d) => d.data.name);
                    },
                    function(update) {
                        return update;
                    },
                    function(exit) {
                        return exit.call(text => text.transition().duration(300).remove().attr({
                            'x': (d) => mouseX,
                            'font-size': 0
                        }));
                    }

                )
                .call(text => text.transition().duration(1000).attr({
                    'x': (d) => d.y + 20,
                    'font-size': 15,
                    'fill': 'black',
                }));
        }
        updateText(textLinks);
    }

    chartBuilder(json);
    
    return (
        <div id="chart"></div>
    )
}

export default Builder