u.preloader = function(node, files, _options) {

	var callback, callback_min_delay

	// additional info passed to function as JSON object
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {

			switch(argument) {
				case "callback"				: callback				= _options[argument]; break;
				case "callback_min_delay"	: callback_min_delay	= _options[argument]; break;
			}

		}
	}



	if(!u._preloader_queue) {
		u._preloader_queue = document.createElement("div");
//		u._preloader_queue = u.ae(document.body, "div");
		u._preloader_processes = 0;

		if(u.e && u.e.event_pref == "touch") {
			u._preloader_max_processes = 1;
		}
		// TODO: option to load more simultaneously - implement as parameter as well?
		else {
			u._preloader_max_processes = 4;
		}

	}



	if(node && files) {

		var entry, file;
		var new_queue = u.ae(u._preloader_queue, "ul");
		new_queue._callback = callback;
		new_queue._node = node;
		new_queue._files = files;
		new_queue.nodes = new Array();
		new_queue._start_time = new Date().getTime();

		for(i = 0; file = files[i]; i++) {
			entry = u.ae(new_queue, "li", {"class":"waiting"});
			entry.i = i;
			entry._queue = new_queue
			entry._file = file;
		}

		// add waiting class on reuest node
		u.ac(node, "waiting");
		// callback to request node (in queue)
		if(typeof(node.waiting) == "function") {
			node.waiting();
		}
	}

	u._queueLoader();

	return u._preloader_queue;
}

u._queueLoader = function() {

//	u.bug("_queueLoader:" + u.preload_processes);

	// still items in queue
//	u.bug("li.waiting:" + u.qs("li.waiting", u._preloader_queue))
	if(u.qs("li.waiting", u._preloader_queue)) {

		while(u._preloader_processes < u._preloader_max_processes) {

			var next = u.qs("li.waiting", u._preloader_queue);
			if(next) {

				// it this the fist node of queue? (does node still have waiting position
				if(u.hc(next._queue._node, "waiting")) {
					// adjust classes on request node
					u.rc(next._queue._node, "waiting");
					u.ac(next._queue._node, "loading");
					// callback - loading has begun
					if(typeof(next._queue._node.loading) == "function") {
						next._node._queue.loading();
					}

				}
				u._preloader_processes++;

//				u.bug("next:" + u.qs("li.waiting", u._preloader_queue) + ", " + next)
				u.rc(next, "waiting");
				u.ac(next, "loading");


				next.loaded = function(event) {
					this.image = event.target;

					// fallback support
					this._image = this.image;

					// this._image = {};
					// this._image.width = event.target.width;
					// this._image.height = event.target.height;
					// this._image.src = event.target.src;

					this._queue.nodes[this.i] = this;

//					u.as(this, "backgroundImage", "url("+event.target.src+")");
//					u.bug("loaded and used")

					u.rc(this, "loading");
					u.ac(this, "loaded");

					u._preloader_processes--;

					if(!u.qs("li.waiting,li.loading", this._queue)) {

						// remove loading class from request node
						u.rc(this._queue._node, "loading");
						// callback to specific callback function
						if(typeof(this._queue._callback) == "function") {
							this._queue._node._callback = this._queue._callback;
							this._queue._node._callback(this._queue.nodes);
						}
						// or callback to default (loaded)
						else if(typeof(this._queue._node.loaded) == "function") {
							this._queue._node.loaded(this._queue.nodes);
						}
					}

					u._queueLoader();
				}
				u.loadImage(next, next._file);
			}
			else {
				break
			}
		}

	}


}


u.loadImage = function(node, src) {
//		u.bug("load image: " + u.nodeId(node) + ", " + src);

	// create new image
	var image = new Image();
	image.node = node;

	u.ac(node, "loading");
    u.e.addEvent(image, 'load', u._imageLoaded);
	u.e.addEvent(image, 'error', u._imageLoadError);

//	TODO: error handling?? missing image or other errors
//		u.e.addEvent(image, 'data', u.i._debug);


//		u.bug("image load:" + image.onload)
//		u.e.addEvent(image, 'error', u.i._debug);
//		u.e.addEvent(image, 'data', u.i._debug);
//		u.e.addEvent(image, 'progress', u.i._debug);
//		u.e.addEvent(image, 'done', u.i._debug);
//		u.e.addEvent(image, 'load', u.i._debug);
//		u.e.addEvent(image, 'complete', u.i._debug);

//		image.onload = function(event) {
		// call event reciever
//			this.e.loaded(event);
//		}

	image.src = src;
}

/**
*
*/
u._imageLoaded = function(event) {
	u.rc(this.node, "loading");
	// notify base
	if(typeof(this.node.loaded) == "function") {
		this.node.loaded(event);
	}

//		delete this;
//		this.src = "/img/mobile_touch/dot.gif";

}
u._imageLoadError = function(event) {

//		u.xInObject(event);
	u.rc(this.node, "loading");
	u.ac(this.node, "error");
	// notify base
	// fallback to loaded if no failed callback function declared 
	if(typeof(this.node.loaded) == "function" && typeof(this.node.failed) != "function") {
		this.node.loaded(event);
	}
	else if(typeof(this.node.failed) == "function") {
		this.node.failed(event);
	}
}

// ???
u._imageLoadProgress = function(event) {

	u.bug("progress")
	// notify base
	if(typeof(this.node.progress) == "function") {
		this.node.progress(event);
	}
	
}

u._imageLoadDebug = function(event) {
	u.bug("event:" + event.type);
	u.xInObject(event);
}

