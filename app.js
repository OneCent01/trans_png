const displaySection = document.getElementsByClassName('display')[0]

const imageCanvas = (img) => {
  const floatingCanvas = document.createElement('canvas')
  floatingCanvas.height = img.height
  floatingCanvas.width = img.width
  floatingCanvas.getContext('2d').drawImage(img, 0, 0)
  return floatingCanvas
}

const fileInput = document.getElementsByTagName('input')[0]

fileInput.addEventListener('change', e => {
	const file = e.target.files[0]
	const img = new Image();
    var objectUrl = URL.createObjectURL(file)
    img.onload = () => {
    	const originalImageCanvas = imageCanvas(img)
		const bits = originalImageCanvas.getContext('2d').getImageData(0, 0, originalImageCanvas.width, originalImageCanvas.height)
		let i = 0, notBlack, notWhite
		while(i < bits.data.length) {
			notBlack = (
				bits.data[i] !== 0
				|| bits.data[i+1] !== 0
				|| bits.data[i+2] !== 0
			)

			notWhite = (
				bits.data[i] !== 255
				|| bits.data[i+1] !== 255
				|| bits.data[i+2] !== 255
			)


			if(notBlack) {
				if(notWhite) {
					bits.data[i+3] = 255 - Math.round(
						(
							bits.data[i]
							+ bits.data[i+1]
							+ bits.data[i+2]
						) / 3
					)
					bits.data[i] = 0
					bits.data[i+1] = 0
					bits.data[i+2] = 0
					
				} else {
					bits.data[i+3] = 0
				}
			} 
			i += 4
		}

		const newImageCanvas = document.createElement('canvas')
		newImageCanvas.width = originalImageCanvas.width 
		newImageCanvas.height = originalImageCanvas.height

		const newImageContext = newImageCanvas.getContext('2d')

		newImageContext.putImageData(bits, 0, 0)

		const imageUrl = newImageCanvas.toDataURL('image/png', 1.0);
		const newImg = document.createElement('img')
		newImg.onload = () => {
			displaySection.appendChild(img)
			displaySection.appendChild(newImg)
		}
		newImg.src = imageUrl
    }
    img.src = objectUrl
})


