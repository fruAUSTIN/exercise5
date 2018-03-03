# <WARNING>
# Everything within sections like <TAG> is generated and can
# be automatically replaced on deployment. You can disable
# this functionality by simply removing the wrapping tags.
# </WARNING>

# <DOCKER_FROM>
FROM aldryn/base-project:3.23
# </DOCKER_FROM>

#RUN apt-get remove -y node
# Origami addition
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y --force-yes nodejs
RUN apt-get install -y git ruby
RUN ln -sf /usr/bin/nodejs /usr/local/bin/node
RUN ln -sf /usr/bin/npm  /usr/local/bin/npm


#
# # Rest of Origami install
#RUN npm install
#RUN npm install -g origami-build-tools
#RUN npm install -g bower
