/** @jsx React.DOM */
var webapp = {
    /* mode: client|standalone */

    initialize : function(mode, pgApp) {
        
        React.initializeTouchEvents(true);
        var cx = React.addons.classSet;
        var selectedPhotos = [];
        //var apiBase = 'http://localhost:1337/';
        var apiBase = 'http://10.16.72.221:1337/';
        var flipPlayBack = false;
        var phoneGapApp = pgApp;

        window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                  };
        })();

        var getPhotos = function(url, callback) {
            console.log('getPhotos, ' + mode);

            // returns json structure array of photo images 
            /*
            Example:
            {
                src : [string],
                dateCreated : [Date]
            }
            */
            
            if (mode == 'standalone') {
                var photolist = [];

                if (phoneGapApp != undefined) {
                    phoneGapApp.getPhoneGalleryPhotos();
                }

                // get from phone
                callback(photolist);
            } else 
            if (mode == 'client') {
                $.get( apiBase + url, function( result ) {
                    var photolist = [];
                    for(var i=0; i<result.length; i++) {
                        
                        photolist.push({
                            src : result[i].src,
                            isSelected : false
                        });
                    }
                    callback(photolist);
                });
            }
        };

        var render = function(canvas, ctx, counter, photos, flipOptions) {
            //console.log(ctx, photos[counter]);
            if (photos!=undefined && ctx!=undefined && canvas!=undefined && flipOptions!=undefined && flipPlayBack) {
                if (counter < photos.length) {
                    
                    setTimeout(function() {
                        requestAnimFrame(function() {
                            render(canvas, ctx, counter, photos, flipOptions);
                        });   

                        // draw stuff
                        ctx.drawImage(photos[counter], 0, 0, canvas.width, canvas.height);

                        counter++;

                    }, 1000 / flipOptions.fps);
                } else {
                    // loop for insanity...
                    if (flipOptions.loop) {
                        counter = 0;
                        requestAnimFrame(function() {
                            render(canvas, ctx, counter, photos, flipOptions);
                        });
                    }
                }   
            }
        };

        var padtext = function(text, paddingChar, length) {
            for (var i=0; i<=(length - text.length); i++) {
                text = paddingChar + text;
            }
            return text;
        };

        //loading view

        var loadingView = React.createClass({
            getInitialState: function() {
                return {
                    loadingComplete : true
                };
            },
            componentDidMount: function() {
                // hide this
                this.setState({
                    loadingComplete : true
                });
            },
            render: function() {
                return (
                    <div id="loading" className={this.state.loadingComplete ? 'hide' : 'no-hide'}>
                        <label>Loading Assets</label>
                    </div>
                );
            }
        });

        var cameraStreamView = React.createClass({
            getInitialState: function() {
                return {
                    data:true
                };
            },
            componentDidMount: function() {
            },
            render: function() {
                return (
                    <div id="cameraview" className={this.props.active ? 'no-hide' : 'hide'}>
                        <canvas id="canvascameraview"></canvas>
                    </div>
                );
            }
        });


        var flipCanvas = React.createClass({
            getInitialState: function() {
                return {
                    images: []
                }  
            },
            componentDidMount: function() {
                $.get( this.props.url, function( result ) {
                    
                    var set = parseInt(this.props.set);
                    var getImages = new Array(result[set].end);

                    for(var k=result[set].start; k<result[set].end; k++) {
                        getImages[k] = 'data/' + result[k].prefix + '_' + padtext('' + result[k].start, '0', 3) + '.' + result[k].type;
                    }

                    this.setState({
                        images : getImages
                    });
                }.bind(this));
            },
            render: function() {
                return (
                    <canvas id="canvas"></canvas>
                );
            }
        });


        var flipGallery = React.createClass({
            getInitialState: function() {
                return {
                    thumbs: []
                };
            },
            componentDidMount: function() {
                $.get( apiBase + this.props.url, function( result ) {
                    var getThumbs = new Array(result.length);
                    for(var k=0; k<result.length; k++) {
                        getThumbs[k] = {
                            src : 'data/' + result[k].prefix + '_' + padtext('' + result[k].start, '0', 3) + '.' + result[k].type,
                            id : k
                        }
                    }
                    this.setState({
                        thumbs : getThumbs
                    });
                }.bind(this));
            },
            render: function() {
                var flipGalleryNodes = this.state.thumbs.map(function(thumbnail) {
                    return <flipGalleryThumb img={thumbnail.src} id={thumbnail.id} />;
                });
                return (
                    <div id="gallery" className={this.props.active ? 'no-hide' : 'hide'}>
                        <div className="row">
                            {flipGalleryNodes}
                        </div>
                    </div>
                );

            }
        });

        var flipGalleryThumb = React.createClass({
            handleClick: function(event) {
                //console.log('click', event.target.getAttribute('data-set'));

                // open the flipscene view

                /*
                React.renderComponent(
                    <flipCanvas url="data/data.json" set={event.target.getAttribute('data-set')} />,
                    document.getElementById('viewflip')
                );
                */
            },
            render: function() {
                return (
                    <div className="col-xs-6 col-md-3">
                        <a className="thumbnail">
                            <img data-set={this.props.id} data-src="holder.js/100%x100" src={this.props.img} alt="" onClick={this.handleClick.bind(this)} />
                        </a>
                    </div>
                );
            }
        });


        var selectPhotosView = React.createClass({
            getInitialState: function() {
                return {
                    photos : [],
                    selectedphotos : []
                };
            },
            getPhotosComplete: function(data) {
                this.setState({
                    photos : data
                });
            },
            componentDidMount: function() {

                if (this.props.active) {
                    getPhotos(this.props.url, this.getPhotosComplete);
                }

            },
            handleSelectedPhotoChanged:function(data) {
                //console.log('handleSelectedPhotoChanged', data);
                this.setState({
                    photos : this.state.photos,
                    selectedphotos : data.selectedPhotos
                });
            },
            handleonMakeFlipScene:function() {
                this.props.onMakeFlipScene();
            },
            handleResetSelected:function() {
                selectedPhotos = [];
                this.setState({
                    selectedphotos : [] 
                });
            },
            render: function() {
                console.log('render selectPhotosView', this.state.selectedphotos);
                // interesting lesson here, if i want multiple items with their own custom event handlers, it needs to be created in the return below
                return (
                    <div id="selectphotosview" className={this.props.active ? 'no-hide' : 'hide'} >
                        <photoSelectedList photos={this.state.selectedphotos} onMakeFlipScene={this.handleonMakeFlipScene} onResetSelected={this.handleResetSelected} />
                        <div className="row photo-roll">
                            {this.state.photos.map(function(photo, i) {

                                var isFound = false;
                                var isSelected = false;
                                for(var k=0; k<this.state.selectedphotos.length && !isFound; k++) {
                                    if (this.state.selectedphotos[k] == photo.src) {
                                        isFound = true;
                                        isSelected = true;
                                    }
                                }

                                return (
                                    <photoThumb img={photo.src} onSelectedPhotoChanged={this.handleSelectedPhotoChanged} selected={isSelected} />
                                );
                            }, this)}
                        </div>
                    </div>
                );
            }
        });

        var photoSelectedListThumb = React.createClass({
            render: function() {
                return (
                    <li>
                        <img src={this.props.src} />
                    </li>
                );
            }
        });

        var photoSelectedList = React.createClass({
            getInitialState: function() {
                return {
                    active:true
                };
            },
            handleMakeFlipSceneClick: function() {
                // create canvas to show flip scene
                //console.log('photoSelectedList:handleMakeFlipSceneClick');
                this.props.onMakeFlipScene();
            },
            handleResetClick: function() {
                this.props.onResetSelected();
            },
            render: function() {

                var selectedPhotoNodes = this.props.photos.map(function(image) {
                    return <photoSelectedListThumb src={image} />;
                });
                
                return this.state.active ? (
                    <div className="navbar navbar-inverse navbar-static-top float-menu-top selected-photos">
                        <button type="button" className="btn pull-left btn-default navbar-btn btn-reset" onClick={this.handleResetClick.bind(this)} >
                            <span className="glyphicon glyphicon-remove"></span>
                        </button>
                        <ul>{selectedPhotoNodes}</ul>
                        <button type="button" className="btn pull-right btn-default navbar-btn btn-previewflip" onClick={this.handleMakeFlipSceneClick.bind(this)} >
                            <label>{this.props.photos.length}</label><span className="glyphicon glyphicon-play-circle"></span>
                        </button>
                    </div>
                ): '';

            }
        });

        var photoThumb = React.createClass({
            getInitialState: function() {
                return {
                    selected : this.props.selected
                };
            },
            handleClick: function(event) {

                var isfound = false;
                var foundindex = 0;
                for(var k=0; k<selectedPhotos.length && !isfound; k++) {
                    if (selectedPhotos[k] == this.props.img) {
                        isfound = true;
                        foundindex = k;
                    }
                }
                if (!isfound) {
                    selectedPhotos.push(this.props.img);
                } else {
                    var tmp_array = selectedPhotos.slice(0, foundindex);
                    selectedPhotos = tmp_array.concat(selectedPhotos.slice(foundindex+1, selectedPhotos.length));
                }

                var newstate = !this.state.selected;
                this.setState({
                    selected: newstate
                });

                this.props.selected = newstate;

                this.props.onSelectedPhotoChanged({ selectedPhotos : selectedPhotos });
            },
            componentDidMount: function() {
                this.setState({
                    selected : this.props.selected
                });
            },
            render: function() {
                var cx = React.addons.classSet;
                var classes = cx({
                    'img-selector pull-right glyphicon glyphicon-ok-circle' : true,
                    'img-selector selected pull-right glyphicon glyphicon-ok-circle' : this.props.selected,
                });
                return (
                    <div className="col-xs-6 col-md-3 photo-item" onClick={this.handleClick} >
                        <div className="thumbnail">
                            <div className={classes}></div>
                            <img ref="image" data-src="holder.js/100%x100" src={this.props.img} alt=""  />
                        </div>
                    </div>
                );
            }
        });

        var previewFlip = React.createClass({
            canvas : {},
            ctx : {},
            counter : 0,
            images_list : [],
            animate: function(that) {
                //console.log(this.counter);
                //setTimeout(function() {});
                if (that.counter < that.props.photos.length) {
                    setTimeout(function() {
                        requestAnimFrame(function() {
                            that.animate(that);
                        });   

                        // draw stuff
                        that.ctx.drawImage(that.images_list[that.counter], 0, 0, that.canvas.width, that.canvas.height);

                        that.counter++;

                    }, 1000 / that.props.flipOptions.fps);
                } else {
                    // loop for insanity...
                    if (that.props.flipOptions.loop) {
                        that.counter = 0;
                        requestAnimFrame(function() {
                            that.animate(that);
                        });
                    }
                }
            },
            initFlipAnimation : function() {
                console.log('initFlipAnimation:', this.props.photos);

                // sort photos alphabetail order values if possible or date time stamp

                for(var k=0; k<this.props.photos.length; k++) {
                    var img = new Image();
                    img.index = k;
                    img.src = this.props.photos[k];
                    this.images_list.push(img);
                }

                //this.animate(this);
                render(this.canvas, this.ctx, this.counter, this.images_list, this.props.flipOptions);
            },
            componentDidMount: function() {
                this.canvas = this.refs.previewFlipCanvas.getDOMNode();
                this.ctx = this.canvas.getContext('2d');
            },
            render: function() {
                this.initFlipAnimation();

                return (
                    <div id="viewflip" className={this.props.active ? 'no-hide' : 'hide'} >
                        <canvas ref="previewFlipCanvas" id="previewFlipCanvas"></canvas>
                    </div>
                );
            }
        });

        // app navigation
        var buttonTakePhoto = React.createClass({
            getInitialState: function() {
                return {
                    active:false
                };
            },
            handleClick: function(event) {
                console.log('buttonTakePhoto', 'click');
                this.setState({active : !this.state.active});
                this.props.onOpen({view:this.props.view});
            },
            componentDidMount: function() {

            },
            render: function() {
                return (
                    <div className="btn-group" id="grouptakephoto">
                        <button type="button" className="btn btn-primary btn-default" id="actiontakephoto" 
                            onClick={this.handleClick.bind(this)} >
                            <span className="glyphicon glyphicon-camera glyphicon-lg"></span></button>
                    </div>
                );
            }
        });

        var buttonViewFlipGallery = React.createClass({
            getInitialState: function() {
                return {
                    active:false
                };
            },
            handleClick: function(event) {
                console.log('buttonViewFlipGallery', 'click');
                this.setState({active : !this.state.active});
                this.props.onOpen({view:this.props.view});
            },
            componentDidMount: function() {

            },
            render: function() {
                return (
                    <div className="btn-group" id="groupgallery">
                        <button type="button" className="btn btn-primary btn-default" id="actiongallery" 
                            onClick={this.handleClick.bind(this)} >
                            <span className="glyphicon glyphicon-film glyphicon-lg"></span></button>
                    </div>
                );
            }
        });

        var buttonViewPhotos = React.createClass({
            getInitialState: function() {
                return {
                    active:false
                };
            },
            handleClick: function(event) {
                console.log('buttonViewPhotos', 'click');
                this.setState({active : !this.state.active});
                this.props.onOpen({view:this.props.view});
            },
            componentDidMount: function() {

            },
            render: function() {
                return (
                    <div className="btn-group" id="groupgallery">
                        <button type="button" className="btn btn-primary btn-default" id="actionphotos" 
                            onClick={this.handleClick.bind(this)} >
                            <span className="glyphicon glyphicon-picture glyphicon-lg"></span></button>
                    </div>
                );
            }
        });

        var appHeader = React.createClass({
            componentDidMount: function() {

            },
            render: function() {
                return (
                    <div id="header" class="header"></div>
                );
            }
        });

        var appNavigation = React.createClass({
            getInitialState: function() {
                return {
                    activeView:'photos'
                };
            },
            componentDidMount: function() {

            },
            handleButtonClick: function(view) {
                this.props.onOpenView(view);
            },
            render: function() {
                return (
                    
                    <div className="controls" id="controls">
                        <div className="nav-bottom-fixed" >
                            <div className="btn-group btn-group-lg btn-group-justified">
                                <buttonTakePhoto view="camera" onOpen={this.handleButtonClick} />
                                <buttonViewPhotos view="photo-gallery" onOpen={this.handleButtonClick} />
                                <buttonViewFlipGallery view="flip-gallery" onOpen={this.handleButtonClick}/>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        /* screen mode */
        /*
            camera : invoke camera
            photo-gallery : get photos from web service or camera
            flip-gallery : flip gallery
            preview-flip : preview flip from selected photos
        */
        var app = React.createClass({
            getInitialState: function() {
                return {
                    currentView : 'photo-gallery',
                    flipOptions: {
                        fps : 20,
                        loop : true
                    }
                };
            },
            isViewActive : function(view) {
                var result = (view == this.state.currentView);
                //console.log('isViewActive', view, this.state.currentView, result);
                return result;
            },
            handleOpenView: function(event) {
                flipPlayBack = (event.view == 'preview-flip');
                this.setState({currentView : event.view});
            },
            handleMakeFlipScene: function(event) {
                flipPlayBack = true;
                this.setState({currentView : 'preview-flip'});  
            },
            render: function() {
                //console.log('render:app', this.state.currentView);
                //console.log(this.state.flipOptions);
                return (
                    <div className="container-fluid">
                        <appHeader />    

                        <div className="action-view">
                            <cameraStreamView active={this.isViewActive('camera')} />
                            <selectPhotosView url="photo" onMakeFlipScene={this.handleMakeFlipScene} active={this.isViewActive('photo-gallery')} />
                            <previewFlip active={this.isViewActive('preview-flip')} photos={selectedPhotos} flipOptions={this.state.flipOptions} />
                            <flipGallery url="flipscene" active={this.isViewActive('flip-gallery')} />
                            <loadingView active={this.isViewActive('loading')}/>
                        </div>

                        <appNavigation onOpenView={this.handleOpenView} />

                    </div>
                );
            }
        });

        React.renderComponent(
            <app />,
            document.getElementById('app')
        );

    }
};
