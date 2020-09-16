const displaySection = document.getElementsByClassName('display')[0]

const colorRangeStartInput = document.getElementsByClassName('start_color_input')[0]
const colorRangeEndInput = document.getElementsByClassName('end_color_input')[0]

const transformButton = document.getElementsByClassName('transform_button')[0]
const downloadButton = document.getElementsByClassName('download_button')[0]
const inverseButton = document.getElementsByClassName('flip_cut_button')[0]

const fileInput = document.getElementsByTagName('input')[0]

const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
const hexToRgb = (hex) => {
	hex = hex.replace(
		shorthandRegex, 
		(m, r, g, b) => (r + r + g + g + b + b)
	)
	
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return (
		result 
		? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} 
		: null
	)
}

const imageCanvas = (img) => {
  const floatingCanvas = document.createElement('canvas')
  floatingCanvas.height = img.height
  floatingCanvas.width = img.width
  floatingCanvas.getContext('2d').drawImage(img, 0, 0)
  return floatingCanvas
}

let originalImageCanvas

let removeColors = true

inverseButton.addEventListener('click', (e) => {
	removeColors = !removeColors
	inverseButton.innerHTML = removeColors ? 'Remove' : 'Keep'
})

transformButton.addEventListener('click', e => {
	const bits = originalImageCanvas.getContext('2d').getImageData(0, 0, originalImageCanvas.width, originalImageCanvas.height)
	const startColor = hexToRgb(colorRangeStartInput.value)
	const endColor = hexToRgb(colorRangeEndInput.value)
	const redRange = [startColor.r, endColor.r].sort()
	const greenRange = [startColor.g, endColor.g].sort()
	const blueRange = [startColor.b, endColor.b].sort()
	let i = 0, notBlack, notWhite
	while(i < bits.data.length) {
		const inRedRange = (
			bits.data[i] >= redRange[0]
			&& bits.data[i] <= redRange[1]
		)
		const inGreenRange = (
			bits.data[i+1] >= greenRange[0]
			&& bits.data[i+1] <= greenRange[1]
		)
		const inBlueRange = (
			bits.data[i+2] >= blueRange[0]
			&& bits.data[i+2] <= blueRange[1]
		)
		const inRange = (
			inRedRange
			&& inGreenRange
			&& inBlueRange
		)
		if(removeColors ? inRange : !inRange) {
			bits.data[i+3] = 0
		}

		i += 4
	}

	const newImageCanvas = document.createElement('canvas')
	newImageCanvas.width = originalImageCanvas.width 
	newImageCanvas.height = originalImageCanvas.height

	const newImageContext = newImageCanvas.getContext('2d')

	newImageContext.putImageData(bits, 0, 0)

	const imageUrl = newImageCanvas.toDataURL('image/png', 1.0)
	const newImg = document.createElement('img')
	newImg.classList.add('transformed_image')

	newImg.onload = () => {
		if(displaySection.lastChild.classList.contains('transformed_image')) {
			displaySection.removeChild(displaySection.lastChild)
		}
		displaySection.appendChild(newImg)
	}
	newImg.src = imageUrl
})

fileInput.addEventListener('change', e => {
	while(displaySection.firstChild) {
		displaySection.removeChild(displaySection.firstChild)
	}
	const file = e.target.files[0]
	const img = new Image();
    var objectUrl = URL.createObjectURL(file)
    img.onload = () => {
    	originalImageCanvas = imageCanvas(img)

    	displaySection.appendChild(img)

		const arrow = document.createElement('span')

		arrow.classList.add('arrow')
		arrow.innerHTML = '&rarr;'

		displaySection.appendChild(arrow)

    }
    img.src = objectUrl
})


downloadButton.addEventListener('click', (e) => {
	if(displaySection.lastChild.classList.contains('transformed_image')) {
		const download = document.createElement('a')
		download.href = displaySection.lastChild.src
		download.download = 'transformed.png'
		download.click()
	} else {
		alert('No transformed image to download')
	}
})