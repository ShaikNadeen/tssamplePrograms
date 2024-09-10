import ImageService from './image.service';

export default function calculateMediaWidthAndHeight(mediaWidth: number, mediaHeight: number, maxWidthAllowed: number, maxHeightAllowed: number) {
	const imageAspectRatio = mediaWidth / mediaHeight;

	let mediaWidthToSet: number = 0;
	let mediaHeightToSet: number = 0;
	if (mediaWidth >= mediaHeight) {
		mediaWidthToSet = maxWidthAllowed;
		mediaHeightToSet = mediaWidthToSet / imageAspectRatio;
		mediaHeightToSet = ImageService.getImageHeight(mediaWidthToSet, imageAspectRatio);

		if (mediaHeightToSet > maxHeightAllowed) {
			mediaHeightToSet = maxHeightAllowed;
			mediaWidthToSet = ImageService.getImageWidth(mediaHeightToSet, imageAspectRatio);
		}
	} else if (mediaHeight > mediaWidth) {
		mediaHeightToSet = maxHeightAllowed;
		mediaWidthToSet = imageAspectRatio * mediaHeightToSet;
		mediaWidthToSet = ImageService.getImageWidth(mediaHeightToSet, imageAspectRatio);

		if (mediaWidthToSet > 0.81 * (window.innerWidth - 300)) {
			mediaWidthToSet = maxWidthAllowed;
			mediaHeightToSet = ImageService.getImageHeight(mediaWidthToSet, imageAspectRatio);
		}
	}
	return { mediaWidthToSet, mediaHeightToSet };
}
