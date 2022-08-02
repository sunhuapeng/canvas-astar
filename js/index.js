var cvs = document.getElementById("cvs");
var btn = document.getElementById("btn")
//创建image对象
var imgObj = new Image();
imgObj.src = "../img/floor.jpg";
var ctx = null
// 识别精度
let accuracy = 10 // 像素
const colorDeff = 40 // 色差小于这个值便识别为可通行路段
const standardColor = [0, 0, 0]// 计算色差的标准色（不可行走的颜色）
const limit = 4; // 颜色坐标偏移量

let imgW = 0
let imgH = 0
let points = [] // 可行走点位
let runFlag = [] // 标记是否可行走的二维数组 可行走为1 不可行走为0
/**
 * 
 * @param {颜色数据} pixelData 
 * @param {图像宽度} width 
 * @param {图像高度} height 
 */
var getImgColors = (pixelData, width, height) => {
    let row = 0
    let col = 0
    let flagRow = -1
    let flagCol = -1
    for (let i = 0; i < (pixelData.length / limit); i++) {
        const r = pixelData[i * limit + 0]
        const g = pixelData[i * limit + 1]
        const b = pixelData[i * limit + 2]
        const diff = distance([r, g, b])
        const flag = diff <= colorDeff // 可通行标志
        col++
        if (i % accuracy === 0) {
            flagCol++
        }
        if (i % width === 0) { // 折行
            col = 0
            row++

            flagCol = 0
            if (i % accuracy === 0) {
                // flagCol++
                flagRow++ // 数据数组加一行
            }
        }
        if (i % accuracy === 0) {
            // flagCol++
            if (flag) {
                if (!runFlag[flagCol] && !runFlag[flagCol] !== 0) runFlag[flagCol] = [];
                if (!runFlag[flagCol][flagRow] && runFlag[flagCol][flagRow] !== 0) runFlag[flagCol][flagRow] = 1

                // drawRect(col, row)
            } else {
                if (!runFlag[flagCol]) runFlag[flagCol] = [];
                if (!runFlag[flagCol][flagRow]) runFlag[flagCol][flagRow] = 0

            }
            if (!points[flagCol]) points[flagCol] = [];
            if (!points[flagCol][flagRow]) {
                points[flagCol][flagRow] = {
                    x: col, y: row
                }
            }
        }

    }
}


// 绘制一个矩形
let drawRect = (x, y, w, h, color) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color ? color : "green";
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
}

// 获取色差
var distance = function (color) {
    var i,
        d = 0;
    for (i = 0; i < color.length; i++) {
        d += (color[i] - standardColor[i]) * (color[i] - standardColor[i]);
    }
    return Math.sqrt(d);
};

// 绘制img到canvas
var drawImg = (that) => {
    const { width, height } = imgObj
    // console.log(width, height)
    imgW = width
    imgH = height
    ctx = cvs.getContext('2d');
    cvs.width = width
    cvs.height = height
    ctx.drawImage(that, 0, 0);

    imgData = ctx.getImageData(0, 0, width, height).data
    getImgColors(imgData, width, height)
}

//待图片加载完后，将其显示在canvas上
imgObj.onload = function () {
    drawImg(this)
}


// 计算路径 
function astarCreate(star, end, graph) {
    var maps = new Graph(graph);
    var starPosition = maps.grid[star[0]][star[1]];
    var endPosition = maps.grid[end[0]][end[1]];
    var result = astar.search(maps, starPosition, endPosition,{closest:true});
    return result
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

btn.onclick = () => {
    const start = [0, 0]
    const ex = runFlag.length - 1
    const ey = runFlag[0].length - 1
    const randomX = getRandomInt(ex / 2, ex)
    const randomY = getRandomInt(ey / 2, ey)
    const end = [randomX, randomY]
    // const end = [47, 69]
    drawRect(1, 1, 10, 10, 'green')
    drawRect(points[randomX][randomY].x, points[randomX][randomY].y, 10, 10, 'green')
    let runPoints = []
    if (runFlag) runPoints = astarCreate(start, end, runFlag)
    console.log(runPoints);
    if (runPoints.length !== 0) {

        for (let i = 0; i < runPoints.length; i++) {

            const { x, y } = runPoints[i]

            const { x: x1, y: y2 } = points[x][y]

            drawRect(x1, y2, 2, 2, 'red')
        }
    } else {
        console.log('你无路可逃')
    }

}