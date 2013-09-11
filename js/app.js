$(document).ready(function (){
	var App = new XF.App({

		settings: {
			applicationVersion: '1.1',
			noCache: false,
			componentUrlPrefix: 'js/components/',
			templateUrlPrefix: 'tmpl/',
			dataUrlPrefix: 'mocks/'

		},

        animations: {
            standardAnimation: 'slideleft',
            types: {

            }
        },

		device: {
			types : [{
					name : 'tablet',
					range : {
						max : null,
						min : 569
					},
					templatePath : 'desktop/',
					fallBackTo : 'default',
                    defaultAnimation: 'fade'
				}, {
					name : 'mobile',
					range : {
						max : 568,
						min : null
					},
					templatePath : 'mobile/',
					fallBackTo : 'default'
			}]
		},

		router: {
			routes: {
				'': 			        'login',
				'agenda': 		        'agenda',
                'favs':                 'favourites',
                'fb':                   'feedback',
                'sps':                  'speakers',
                'sp/:id':               'speaker',
				'pr/:id':	            'presentation',
                'coms/:id':	            'comments'
			},

            login: function () {
                if (XF.storage.get('token') && XF.storage.get('token') != '') {
                    XF.navigate('agenda');
                }
            },

            agenda: function () {
                $('#backbtn').hide();
            },

            presentation: function (id) {
                $('#backbtn').removeData('href').attr('data-href', '#agenda').show();
                this.EventID = id;
                XF.trigger('component:presentation:refresh');
            },

            comments: function (id) {
                $('#backbtn').removeData('href').attr('data-href', '#pr/' + id).show();
                this.EventID = id;
                XF.trigger('component:comments:refresh');
            },

            favourites: function (id) {
                $('#backbtn').removeData('href').attr('data-href', '#agenda').show();
            },

            speakers: function (id) {
                $('#backbtn').removeData('href').attr('data-href', '#agenda').show();
            },

            speaker: function (id) {
                $('#backbtn').removeData('href').attr('data-href', '#sps').show();
            },

            feedback: function (id) {
                $('#backbtn').removeData('href').attr('data-href', '#agenda').show();
            }
        }

	});

    XF.api = {
        checkToken : function () {
            this.token = XF.storage.get('token') || '';
            if (this.token === '') {
                this.showLogin();
            } else {
                this.getMyData();
            }
        },

        showLogin : function () {
            $('.sec-login').show();
        },

        getToken : function () {
            var username = $('[name="username"]').val(),
                userpassword = $('[name="userpassword"]').val();

            $.ajax({
                url : 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/authorization.json?login=' + username + '&password=' + encodeURIComponent(userpassword).replace(/[!'()]/g, escape).replace(/\*/g, "%2A"),
                dataType: 'json',
                crossDoamin: true,
                beforeSend : function () {
                    $('[name="username"],[name="userpassword"],[name="userlogin"]').attr('disabled','disabled');
                },
                success : function (data) {
                    XF.storage.set('token', data.token);
                    XF.api.token = data.token;
                    $('.sec-login').hide();
                    XF.api.getMyData();
                    $('[name="username"],[name="userpassword"],[name="userlogin"]').removeAttr('disabled');

                    ///////////////////////
                    XF.trigger('navigate', 'agenda');
                },
                error : function (data) {
//                    alert('Error during authorization. Please try again.');
                    var notify = XF.ui.popup.createNotification('Error. Please try again.');
                    XF.ui.popup.show(notify);
                    setTimeout(function () {
                        XF.ui.popup.hide(notify);
                        $('[name="username"],[name="userpassword"],[name="userlogin"]').removeAttr('disabled');
                    }, 1000);
                }
            });

            return false;
        },

        getMyData : function () {
            this.name = XF.storage.get('name') || '';
            this.photo = XF.storage.get('photo') || '';

            if (this.name === '' || this.photo === '' || this.photo === 'undefined' || this.name.indexOf('undefined') != -1) {
                $.ajax({
                    url : 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/userinfo.json?token=' + XF.api.token,
                    dataType: 'json',
                    success : function (data) {
                        XF.storage.set('name', data.user.firstName + ' ' + data.user.lastName);
                        XF.storage.set('photo', data.user.photoURL);
                        XF.api.name = data.user.firstName + ' ' + data.user.lastName;
                        XF.api.photo = data.user.photoURL;
                        XF.api.setMyData();
                    },
                    error : function (data) {
                        alert('Error during receving personal data.');
                    }
                });
            } else {
                XF.api.setMyData();
            }
        },

        setMyData : function () {
            $('.sec-hello').find('em').text(XF.api.name);
            $('.sec-hello').find('img').attr('src', 'http://evbyminsd7001.minsk.epam.com:4502' + XF.api.photo + '?token=' + XF.api.token);
        },

        logout : function () {
            XF.storage.clear();
            this.showLogin();
        },

        sendComment : function () {

            var text = $('#comment-text').val();

            $.ajax({
                type: 'POST',
                url: 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/comment.json',
                data: {
                    eventid: XF.router.EventID,
                    token: XF.api.token,
                    text : text
                },
                beforeSend: function () {
                    $('.comments-form').find('textarea, button').attr('disabled', 'disabled');
                },
                success: function () {
                    XF.trigger('component:comments:refresh');
                },
                error : function () {
                    var notify = XF.ui.popup.createNotification('Error. Please try again.');
                    XF.ui.popup.show(notify);
                    setTimeout(function () {
                        XF.ui.popup.hide(notify);
                        $('.comments-form').find('textarea, button').removeAttr('disabled');
                    }, 1000);
                }
            });

            return false;
        }
    };

    XF.api.checkToken();
});