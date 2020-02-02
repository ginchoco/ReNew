// ----------------
// SETUP
// ----------------
// Make sure you have Python 2 or 3 installed on your machine, and that you can start a simple server.
// ----------------
// INTRODUCTION
// ----------------
// D3 is a data visualization library created by Mike Bostock. D3 stands for Data Driven Documents, as it helps us create visual representations of data.
// The main library is essentially a collection of modules, each of which is available as a stand-alone module so that you can use that functionality independently from the main library. (Check out https://github.com/d3.) There are also supplementary modules that others have written, such as [popular module] and even D3-array, also written by Mike Bostock. Let's load the main library:
// <script src="https://unpkg.com/d3@5.14.2/dist/d3.min.js"></script>
// if we log d3 to the console, we can see that it is an object with [NUM] entries in it.
// console.log(d3)
// D3 provides a wide array of utility, but two features are at the heart of all this functionality: selections, and the data bind.
// ----------------
// SELECTIONS
// ----------------
// D3 selections allow us to select html elements so we can do things with them. Here, we select the body and assign it to a variable.
const body = d3.select('body')
// We can select elements by id, class name, or element type [others?]. Once we have selected an element, we can do things with it, such as append another element to it. Here we use our body variable (a d3 selection) to append a div element (also assigning that to a variable).
const container = body.append('div')
// If we open developer tools, we can see that we now have a div element nested within the body tag. We can even console log the container variable.
// console.log(container)
// What is it we're looking at? That's a D3 selection. If we want to log the actual element, D3 has a handy method for that: selection.node()
// console.log(container.node())
// I like to make my container responsive on load (at least), so let's create a main.css file and add some styles to the div (as well as the body).
// In order to style our div, we give it a class. This is done through D3's .attr() method
container.attr('class', 'container')
// Now, with our container taking up 100% of our window, we can use it to get dimensions. Remember selection.node()? That will come in handy here.
const bounds = container.node().getBoundingClientRect()
// console.log(bounds)
// With access to our dimensions, we can now set width and height variables
// const width = bounds.width
// const height = bounds.height
  // MARGIN CONVENTION INSERTION
  const margin = {top: 20, right: 20, bottom: 30, left: 40}
  const width = bounds.width - margin.left - margin.right
  const height = bounds.height - margin.top - margin.bottom
// ...and set up our SVG element.
const svg = container.append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('id', 'svg')
  // HEIGHT AND WIDTH ADJUSTMENT
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
// It's good practice to also set up an svg group container. I'll explain why later.
const gContainer = svg.append('g')
  // MARGIN CONVENTION INSERTION
  .attr('transform', `translate(${margin.left},${margin.top})`)
// Ok, now let's load some data. We'll go to over to https://observablehq.com/@d3/bar-chart and pull that dataset. Then, we use async/await d3.csv to load the data.
loadData('data.csv')
async function loadData(dataset) {
  const data = await d3.csv(dataset)
  // console.log(data)
  // If we log our data, we see that value is a string. That's not what we want, so let's convert it to a number.
  data.forEach(d => {
      d.value = +d.value
  });
  // console.log(data)
  // Ok, now that we have our data in the format we want, let's use it to generate some bars. To do this, we'll add to our gContainer selection.
  const bars = gContainer.selectAll('rect')
    // First, we pass the .data() funciton our dataset
    .data(data)
    // Now comes one of the most famously enigmatic parts of d3—the data bind.
    .enter().append('rect')
    // SVG rects need a width and a height
    .attr('width', 20)
    .attr('height', 300)
    // and it's always nice to add a class
    .attr('class', 'bar')
  // Now if we check our dom tree we can see that we have 26 bars. We can even see them on the page! However, they are all on top of one another. In order to space them out, what we want to do now is create our first scale.
  // Scales have two main components: the input domain, and the output range. Let's figure out the domain first.
  const xDomain = data.map(d => d.name)
  // console.log(xDomain)
  const xRange = [0, width]
  // console.log(xRange)
  const xScale = d3.scaleBand()
    .domain(xDomain)
    // And the range, naturally, will be our width
    .range(xRange)
    // we also want to add some padding
    .padding(0.1)
  // Now, we can give our bars an x attribute using our scale. Here, by the way, is the magic of d3 — applying html attributes (or css styles) that are a function of the data.
  bars
    .attr('x', d => xScale(d.name))
    // We can also give it a width determined by our xScale
    .attr('width', xScale.bandwidth())
  // Now that we know a thing or two about scales, let's make a linear scale for our y axis. First we'll calculate our input domain and output range.
  // For the domain, we use d3.extent() to find the min and max values of our values array. For the range, we use an inverted coordinate plane, so that 0 is on the bottom, as opposed to on the top.
  const yDomain = d3.extent(data.map(d => d.value))
  // console.log(yDomain)
  const yRange = [height, 0]
  // console.log(yRange)
  const yScale = d3.scaleLinear()
    .domain(yDomain)
    // here's a little function to make our scale a little prettier and easier to read
    .nice()
    .range(yRange)
  // And now that we have our scale, we can use it! Because of the inverted coordinate plane, we're starting the bars at the top and drawing them down
  bars
    .attr('y', d => yScale(d.value))
    .attr('height', d => yScale(0) - yScale(d.value))
  // And now, finally, we have a bar chart! What's missing? Axes. And in order to have axes, we need space for them. Let's redefine our width and height using the margin convention.
  // [Set up margins, transform/translate gContainer, add margins to svg width/height]
  // Now that we have some margins, it's time to add our axes. We'll start with the x axis
  const xAxis = d3.axisBottom(xScale)
    // And to make it more visually appealing, we remove the outer ticks of the axis
    .tickSizeOuter(0)
  // Now we need to append an svg group, and call our xAxis on it.
  gContainer.append('g')
    .attr('class', 'x axis')
    .call(xAxis)
    // Great, we have an axis... now we just need to position it (at the "0" of our y scale).
    .attr('transform', `translate(${0}, ${yScale(0)})`)
  // Let's do the same with our y axis
  const yAxis = d3.axisLeft(yScale)
    .tickSizeOuter(0)
  gContainer.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
  // We now have a fully finished bar chart! Let's get fancy.
  // let myCounter = 0
  timedUpdate()
  function timedUpdate() {
    setTimeout(() => {
      updateData()
      // console.log('myCounter', myCounter)
      // while (myCounter < 1) {
      //   myCounter++
        timedUpdate()
      // }
    }, 10500)
  }
  function updateData() {
    const randNum = () => Math.floor(Math.random()*27)
    const num = randNum()
    console.log('num', num)
    const numSet = new Set
    let counter = 0
    while (counter < num) { numSet.add(randNum()); counter++ }
    const updatedData = data.filter((d, i) => numSet.has(i))
    console.log('updatedData:')
    console.table(updatedData)
    const t = gContainer.transition()
      .duration(2000)
    const update = gContainer.selectAll('rect')
      .data(updatedData, d => d.name)
    //   .attr('fill', 'black')
    // const enter = update.enter()
    //   .append('rect')
    //   .attr('x', d => xScale(d.name))
    //   .attr('width', xScale.bandwidth())
    //   .attr('height', d => yScale(0) - yScale(d.value))
    //   .attr('y', d => yScale(d.value) - 200)
    //   .attr('fill', 'white')
    //   .transition(t)
    //   .attr('fill', 'green')
    //   .attr('y', d => yScale(d.value))
    // const exit = update.exit()
    //   .attr('fill', 'red')
    //  .transition(t)
    //   .attr('fill', 'white')
    //   .attr('y', d => yScale(d.value) + height * 1.5)
    //   .remove()
    // // console.log('update', update._groups)
    // console.log('updateArr', update._groups[0])
    // // console.log('enter', enter)
    // console.log('enterArr', enter._groups[0])
    // // console.log('exit', exit)
    // console.log('exitArr', exit._groups[0])
    // console.log('====')
      .join(
        enter => enter.append('rect')
          .attr('x', d => xScale(d.name))
          .attr('width', xScale.bandwidth())
          .attr('y', d => yScale(d.value) - 200)
          .attr('height', d => yScale(0) - yScale(d.value))
          .attr('fill', 'white')
        .call(enter => enter.transition(t)
          .attr('fill', 'green')
          .attr('y', d => yScale(d.value))),
        update => update
          .attr('fill', 'black'),
        exit => exit
          .attr('fill', 'red')
        .call(exit => exit.transition(t)
          .attr('y', d => yScale(d.value) + height * 1.5)
          .attr('fill', 'white')
          .remove())
      )
      .on('click', function() {
        const radius = 10
        d3.select(this)
          .attr('stroke-width', '5px')
          .attr('stroke', 'pink')
        .transition().duration(900)
          .attr('y', yScale(0.13))
          .attr('rx', radius)
          .attr('width', radius * 2)
          .attr('height', radius * 2)
      })
  }
}