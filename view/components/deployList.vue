<template>
    <div class="module-wrapper">
        <h4 class="title">Deploy contract</h4>    
        <div :key="index" v-for = "(abi, index) in compileResult.abiList" >
            <h5 class="title">
                <i class="el-icon-caret-bottom" @click="hideDeploy(index)" v-if="showContractDeployList[index]"></i>
                <i class="el-icon-caret-right" @click="showDeploy(index)" v-else></i>
                {{compileResult.contractNameList[index]}}
            </h5>
            
            <deploy 
                v-if="showContractDeployList[index]"
                :account="account"
                :abi="abi" 
                :bytecodes="compileResult.bytecodesList[index]" 
                :offchainCodes="compileResult.offchainCodesList[index]" 
                @deployed="deployed($event, abi, compileResult.contractNameList[index], compileResult.offchainCodesList[index])"> 
            </deploy>            
        </div>
    </div>
</template>
    
<script>
import deploy from './deploy';
export default {
    components: {
        deploy
    },
    props: [
        'compileResult',
        'account'
    ],
    data () {
        return {
            showContractDeployList: []
        };
    },

    created () {
        this.compileResult.abiList.forEach((abi, index) => {
            this.showContractDeployList[index] = false;
        });
    },
    methods: {
        deployed (contractBlock, abi, contractName, offchainCode) {
            this.$emit('deployed', contractBlock, abi, contractName, offchainCode);
        },

        showDeploy (index) {
            this.$set(this.showContractDeployList, index, true);
        },

        hideDeploy (index) {
            this.$set(this.showContractDeployList, index, false);
        }
    }
};
</script>

<style lang="scss">
    
</style>
