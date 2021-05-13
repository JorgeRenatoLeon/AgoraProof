<template>
  <div class="hello">
    <div class="agora-title-box">
      <div class="agora-title">Simulación Videollamada con Agora</div>
    </div>
    <div class='agora-box'>
      <div class="agora-input">
        <div class="agora-text">Appid</div>
        <input v-model="option.appid" placeholder="Appid" clearable/>
      </div>
      <div class="agora-input">
        <div class="agora-text">Token</div>
        <input v-model="option.token" placeholder="Token" clearable/>
      </div>
      <div class="agora-input">
        <div class="agora-text">Nombre del canal</div>
        <input v-model="option.channel" placeholder="Channel Name" clearable/>
      </div>
      <div class="agora-button">
        <button type="primary" @click="joinEvent" :disabled='disableJoin'>Ingresar</button>
        <button type="primary" @click='leaveEvent' plain :disabled='!disableJoin'>Salir</button>
        <button type="primary" @click='prooveAxios'>Obtener Credenciales</button>
      </div>
    </div>
    <div class="agora-view">
      <div class="agora-video">
        <StreamPlayer :stream="localStream" :domId="localStream.getId()" v-if="localStream"></StreamPlayer>
      </div>
      <div class="agora-video" :key="index" v-for="(remoteStream, index) in remoteStreams">
        <StreamPlayer :stream="remoteStream" :domId="remoteStream.getId()"></StreamPlayer>
      </div>
    </div>
  </div>
</template>

<script>
import RTCClient from "../agora-rtc-client";
import StreamPlayer from "./stream-player";
import axios from 'axios';
import
 { log } from '../utils/utils'

export default {
  components: {
    StreamPlayer
  },
  data () {
    return {
      option: {
        appid: '',
        token: '',
        uid: null,
        channel: '',
      },
      disableJoin: false,
      localStream: null,
      remoteStreams: [],
      appId: '',
      token: '',
      channel: ''
    }
  },
  props: {
    msg: String
  },

  methods: {
    async prooveAxios () {
      const body = {specialistUUID: "119e6645-ff41-4c15-8178-10d5f9e5775b"};
      const res = await axios.post('/videocalling', body);
      console.log(res.data);
      this.option.appid = res.data.appId;
      this.option.token = res.data.token;
      this.option.channel = res.data.channel;
    },
    joinEvent () {
      if(!this.option.appid) {
        this.judge('Appid')
        return
      }
      if(!this.option.channel) {
        this.judge('Channel Name')
        return
      }
      this.rtc.joinChannel(this.option).then(() => {
        this.$message({
          message: 'Conexión al canal exitosa',
          type: 'success'
        });
        this.rtc.publishStream().then((stream) => {
          this.$message({
            message: 'Publicación de video exitosa',
            type: 'success'
          });
          this.localStream = stream
        }).catch((err) => {
          this.$message.error('Error al publicar el video');
          log('publish local error', err)
        })
      }).catch((err) => {
        this.$message.error('Error al conectarse al canal');
        log('join channel error', err)
      })
      this.disableJoin = true
    },
    leaveEvent () {
      this.disableJoin = false
      this.rtc.leaveChannel().then(() => {
        this.$message({
          message: 'Salida del canal exitosa',
          type: 'success'
        });
      }).catch((err) => {
        this.$message.error('Error al salir del canal')
        log('leave error', err)
      })
      this.localStream = null
      this.remoteStreams = []
    },
    judge(detail) {
      this.$notify({
        title: 'Notice',
        message: `Please enter the ${detail}`,
        position: 'top-left',
        type: 'warning'
      });
    },
  },
  created() {
    this.rtc = new RTCClient()
    let rtc = this.rtc
    rtc.on('stream-added', (evt) => {
      let {stream} = evt
      log("[agora] [stream-added] stream-added", stream.getId())
      rtc.client.subscribe(stream)
    })

    rtc.on('stream-subscribed', (evt) => {
      let {stream} = evt
      log("[agora] [stream-subscribed] stream-added", stream.getId())
      if (!this.remoteStreams.find((it) => it.getId() === stream.getId())) {
        this.remoteStreams.push(stream)
      }
    })

    rtc.on('stream-removed', (evt) => {
      let {stream} = evt
      log('[agora] [stream-removed] stream-removed', stream.getId())
      this.remoteStreams = this.remoteStreams.filter((it) => it.getId() !== stream.getId())
    })

    rtc.on('peer-online', (evt) => {
      this.$message(`Peer ${evt.uid} is online`)
    })

    rtc.on('peer-leave', (evt) => {
      this.$message(`Peer ${evt.uid} already leave`)
      this.remoteStreams = this.remoteStreams.filter((it) => it.getId() !== evt.uid)
    })
  }
 }
</script>

<style scoped>
  .agora-box {

  }
  .agora-title {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    color: #2c3e50;
  }
  .agora-view {
    display: flex;
    flex-wrap: wrap;
  }
  .agora-video {
    width: 320px;
    height: 240px;
    margin: 20px;
  }
  .agora-input {
    margin: 20px;
    width: 320px;
  }
  .agora-text {
    margin: 5px;
    font-size: 16px;
    font-weight: bold;
  }
  .agora-button {
    display: flex;
    width: 160px;
    justify-content: space-between;
    margin: 20px;
  }
  .agora-video {
    width: 320px;
    height: 240px;
  }
</style>
